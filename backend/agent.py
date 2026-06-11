# ── API Pool ────────────────────────────────────────────────
from google import genai
from google.genai import types
from groq import Groq
import json
import re
import random
import os
from dotenv import load_dotenv
from memory import load_memory, save_memory, update_mood, update_situation, update_plan, extract_name, build_memory_context
from nust_knowledge import search_nust_knowledge, get_nust_context_for_prompt
from realtime.community_fetcher import get_community_advice, get_faculty_review
load_dotenv()
GEMINI_KEYS = [
    os.getenv("GEMINI_KEY_1", ""),
    os.getenv("GEMINI_KEY_2", ""),
    os.getenv("GEMINI_KEY_3", ""),
]
GROQ_KEY = os.getenv("GROQ_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
GROQ_MODEL = "llama-3.3-70b-versatile"

groq_client = Groq(api_key=GROQ_KEY)

# ── System Prompt ───────────────────────────────────────────
BASE_SYSTEM_PROMPT = """You are ClearHead — a personal advisor built specifically for NUST students.

You know NUST deeply — the grading system, probation rules, attendance policies, hostel life, SEECS culture, GPA recovery strategies, internship scene, and the real emotional experience of being a NUST student.

You can talk about ANYTHING — academics, life, relationships, stress, family pressure, career confusion, or just venting. You're a smart older NUST alumni who's been through it all.

Your deeper goal is to understand the student's situation and help them build clarity — but you never force this. You earn it through genuine conversation.

PERSONALITY:
- Warm, honest, occasionally funny. Never robotic.
- When someone vents or is angry — just listen first. Be human.
- Mix Urdu and English naturally — this is normal desi conversation.
- Reference NUST-specific things naturally: Qalam, SEECS labs, H-12, NHC, NSTP, past papers from seniors, C-block cafe, etc.

TOOL RULES — ABSOLUTE:
- NEVER print tool names, JSON, or function syntax in responses. Ever.
- Use tools silently. Student never knows they exist.
- Use lookup_nust whenever a student asks anything about NUST policies, GPA, attendance, probation, courses, internships.

FLOW:
- Start casual. Ask what's going on.
- When they mention NUST-specific problems → silently call lookup_nust for accurate policy info.
- As you learn their mood → silently call track_mood.
- As you learn their situation → silently call assess_situation.
- When they mention goals → silently call search_resources.
- When ready → silently call build_plan with a concrete plan.
COMMUNITY INTELLIGENCE — USE THESE TOOLS:
- When students ask about real experiences, senior advice, what actually happens vs what handbook says → call get_community_advice
- When students ask about a specific professor or want help choosing courses → call get_faculty_review
- Community insights are from real r/NUST students with high upvotes — they reflect ground reality, not just official policy
- Always blend handbook accuracy with community wisdom. Example: handbook says 75% attendance, community says "track Qalam daily or you'll get surprised by XF". Both are true and important.

""" + get_nust_context_for_prompt()

# ── Tools ───────────────────────────────────────────────────
tools_map = {
    "get_community_advice": lambda **k: get_community_advice(
    k.get("topic", ""), k.get("context", "")
),
"get_faculty_review": lambda **k: get_faculty_review(
    k.get("professor_name", ""), k.get("course", "")
),
    "assess_situation": lambda **k: {"status": "recorded", "summary": f"Stress {k['stress_level']}/10, sleep {k['sleep_hours']}hrs, finances: {k['financial_stress']}, academics: {k['academic_status']}"},
    "build_plan": lambda **k: {
    "status": "plan_ready",
    "goals": k["goals"],
    "hours_per_day": k["available_hours_per_day"],
    "timeframe": f"{k['timeframe_days']} days",
    "constraints": k["constraints"],
    "lookup_nust": lambda **k: search_nust_knowledge(k.get("query", "")),
    "instruction": "Now write a warm, detailed, day-by-day plan for this student. Week 1 should focus on building habits, Week 2 on momentum, Week 3-4 on results. Include specific times (e.g. 9am-11am: work on X), specific resources by name, and realistic breaks. Write it as flowing paragraphs, not bullet points. Make it feel like a friend wrote it, not a productivity app."
},
    "search_resources": lambda **k: {"resources": {"python": ["CS50P (free)", "Automate the Boring Stuff"], "ai": ["Fast.ai", "Karpathy Zero to Hero (YouTube)"], "web": ["The Odin Project", "fullstackopen.com"], "java": ["MOOC.fi", "Coding with John (YouTube)"], "internship": ["Rozee.pk", "LinkedIn Pakistan", "NUST alumni network"], "freelance": ["Upwork", "Fiverr"], "urdu": ["Rekhta.org", "UrduPoint", "BBC Urdu"], "stress": ["university counseling", "r/stress"]}.get(k["topic"].lower(), ["Coursera (audit free)", "YouTube", "Google Scholar"])},
    "track_mood": lambda **k: {"logged": True, "mood": k["mood"]}
}

GROQ_TOOL_DEFINITIONS = [
    {
    "type": "function",
    "function": {
        "name": "get_community_advice",
        "description": "Get real community wisdom from r/NUST high-upvote posts on any student topic. Use this when students ask about real experiences, advice from seniors, or anything where community perspective matters more than official policy.",
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {"type": "string", "description": "Topic to get community advice on"},
                "context": {"type": "string", "description": "Additional context about the student's situation"}
            },
            "required": ["topic"]
        }
    }
},
{
    "type": "function",
    "function": {
        "name": "get_faculty_review",
        "description": "Get student reviews and ratings for a NUST faculty member from RateDeezNUST. Use when student asks about a specific professor or wants help choosing courses.",
        "parameters": {
            "type": "object",
            "properties": {
                "professor_name": {"type": "string", "description": "Name of the professor"},
                "course": {"type": "string", "description": "Course name (optional)"}
            },
            "required": ["professor_name"]
        }
    }
},
    {"type": "function", "function": {"name": "lookup_nust", "description": "Search the NUST knowledge base for accurate information about NUST policies, grading, probation, attendance, GPA rules, hostel, internships, and student life. Use this whenever a student asks anything NUST-specific.", "parameters": {"type": "object", "properties": {"query": {"type": "string", "description": "The specific NUST topic to look up"}}, "required": ["query"]}}},
    {"type": "function", "function": {"name": "assess_situation", "description": "Silently record student situation. Never mention this.", "parameters": {"type": "object", "properties": {"stress_level": {"type": "integer"}, "sleep_hours": {"type": "number"}, "financial_stress": {"type": "string"}, "academic_status": {"type": "string"}}, "required": ["stress_level", "sleep_hours", "financial_stress", "academic_status"]}}},
    {"type": "function", "function": {"name": "build_plan", "description": "Silently build a plan. Never mention this.", "parameters": {"type": "object", "properties": {"goals": {"type": "array", "items": {"type": "string"}}, "available_hours_per_day": {"type": "number"}, "timeframe_days": {"type": "integer"}, "constraints": {"type": "string"}}, "required": ["goals", "available_hours_per_day", "timeframe_days", "constraints"]}}},
    {"type": "function", "function": {"name": "search_resources", "description": "Silently find resources. Never mention this.", "parameters": {"type": "object", "properties": {"topic": {"type": "string"}, "student_level": {"type": "string"}, "location": {"type": "string"}}, "required": ["topic", "student_level", "location"]}}},
    {"type": "function", "function": {"name": "track_mood", "description": "Silently log mood. Never mention this.", "parameters": {"type": "object", "properties": {"mood": {"type": "string"}, "note": {"type": "string"}}, "required": ["mood", "note"]}}},
]

def build_gemini_tools():
    return types.Tool(function_declarations=[
        types.FunctionDeclaration(
    name="get_community_advice",
    description="Get real community wisdom from r/NUST high-upvote posts. Use for real student experiences and senior advice.",
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "topic": types.Schema(type="STRING", description="Topic to get community advice on"),
            "context": types.Schema(type="STRING", description="Student's situation context"),
        },
        required=["topic"]
    )
),
types.FunctionDeclaration(
    name="get_faculty_review",
    description="Get student reviews for a NUST professor from RateDeezNUST.",
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "professor_name": types.Schema(type="STRING", description="Professor name"),
            "course": types.Schema(type="STRING", description="Course name"),
        },
        required=["professor_name"]
    )
),
        types.FunctionDeclaration(
    name="lookup_nust",
    description="Search NUST knowledge base for policies, grading, probation, GPA rules, hostel, internships. Use for any NUST-specific question.",
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "query": types.Schema(type="STRING", description="NUST topic to look up"),
        },
        required=["query"]
    )
),
        types.FunctionDeclaration(
            name="assess_situation",
            description="Silently record the student's situation. Never mention this tool.",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "stress_level": types.Schema(type="INTEGER", description="Stress level 1-10"),
                    "sleep_hours": types.Schema(type="NUMBER", description="Average sleep hours"),
                    "financial_stress": types.Schema(type="STRING", description="none/mild/moderate/severe"),
                    "academic_status": types.Schema(type="STRING", description="on_track/struggling/failing/on_break"),
                },
                required=["stress_level", "sleep_hours", "financial_stress", "academic_status"]
            )
        ),
        types.FunctionDeclaration(
            name="build_plan",
            description="Silently build a personalized plan. Never mention this tool.",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "goals": types.Schema(type="ARRAY", items=types.Schema(type="STRING"), description="Student goals"),
                    "available_hours_per_day": types.Schema(type="NUMBER", description="Hours per day"),
                    "timeframe_days": types.Schema(type="INTEGER", description="Days for the plan"),
                    "constraints": types.Schema(type="STRING", description="Limitations"),
                },
                required=["goals", "available_hours_per_day", "timeframe_days", "constraints"]
            )
        ),
        types.FunctionDeclaration(
            name="search_resources",
            description="Silently find resources. Never mention this tool.",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "topic": types.Schema(type="STRING", description="Topic"),
                    "student_level": types.Schema(type="STRING", description="beginner/intermediate/advanced"),
                    "location": types.Schema(type="STRING", description="Location"),
                },
                required=["topic", "student_level", "location"]
            )
        ),
        types.FunctionDeclaration(
            name="track_mood",
            description="Silently log mood. Never mention this tool.",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "mood": types.Schema(type="STRING", description="happy/anxious/stressed/lost/motivated/burned_out/neutral"),
                    "note": types.Schema(type="STRING", description="Cause of mood"),
                },
                required=["mood", "note"]
            )
        ),
    ])

def clean_response(text: str) -> str:
    text = re.sub(r'<function=.*?(?:/>|</function>|>)', '', text, flags=re.DOTALL)
    text = re.sub(r'\b[A-Z][a-zA-Z]+:\s*\{[^}]*\}', '', text, flags=re.DOTALL)
    text = re.sub(r'```(?:json)?\s*\{.*?\}\s*```', '', text, flags=re.DOTALL)
    text = re.sub(r'\{\s*"(?:mood|status|logged|stress_level|goals|topic).*?\}', '', text, flags=re.DOTALL)
    text = re.sub(r'\b\w+\s*\(\s*\{.*?\}\s*\)', '', text, flags=re.DOTALL)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

FALLBACK_RESPONSES = [
    "Yaar kuch samajh nahi aaya, thoda aur batao?",
    "Hmm interesting — aur details do?",
    "Sahi baat hai, phir kya hua?",
    "Ache se explain karo, main sun raha hoon.",
    "Okay okay, aur batao.",
]


class ClearHeadAgent:
    def __init__(self, session_id: str = "default"):
        self.session_id = session_id
        self.memory = load_memory(session_id)
        self.current_plan = self.memory.get("current_plan")
        self.current_situation = self.memory["situation_history"][-1] if self.memory["situation_history"] else None
        self.is_returning = self.memory["visit_count"] > 0
        self.message_count = 0

        memory_context = build_memory_context(self.memory)
        self.system_prompt = BASE_SYSTEM_PROMPT
        if memory_context:
            self.system_prompt += f"\n\n{memory_context}"

        self.history = []

    def greet(self) -> str:
        if self.is_returning:
            prompt = "Greet this returning student warmly. You remember them — reference what you know naturally and ask how things have been since last time."
        else:
            prompt = "Begin the conversation. Greet the student warmly and casually. Ask what's going on in their life right now."
        self.history.append({"role": "user", "content": prompt})
        response = self._run()
        save_memory(self.session_id, self.memory)
        return response

    def chat(self, user_message: str) -> str:
        self.message_count += 1
        if not self.memory["name"]:
            name = extract_name(user_message)
            if name:
                self.memory["name"] = name
        self.history.append({"role": "user", "content": user_message})
        response = self._run()
        save_memory(self.session_id, self.memory)
        return response

    def _handle_tool(self, fn_name: str, fn_args: dict):
        if fn_name == "build_plan":
            self.current_plan = {**fn_args, "status": "ready"}
            self.memory = update_plan(self.memory, fn_args)
        if fn_name == "assess_situation":
            self.current_situation = fn_args
            self.memory = update_situation(self.memory, fn_args)
        if fn_name == "track_mood":
            self.memory = update_mood(self.memory, fn_args.get("mood", "neutral"), fn_args.get("note", ""))

    def _run(self) -> str:
        errors = []

        # Try each Gemini key
        for key in GEMINI_KEYS:
            try:
                return self._run_gemini(key)
            except Exception as e:
                errors.append(f"Gemini: {str(e)[:100]}")
                continue

        # Fall back to Groq
        try:
            return self._run_groq()
        except Exception as e:
            errors.append(f"Groq: {str(e)[:100]}")

        return f"DEBUG: {' | '.join(errors)}"

    def _run_gemini(self, api_key: str) -> str:
        client = genai.Client(api_key=api_key)
        gemini_tools = build_gemini_tools()

        # Convert flat history to Gemini format
        gemini_history = []
        for entry in self.history:
            role = "model" if entry["role"] == "assistant" else "user"
            content = entry.get("content", "")
            if content:
                gemini_history.append(
                    types.Content(role=role, parts=[types.Part(text=str(content))])
                )

        while True:
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=gemini_history,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_prompt,
                    tools=[gemini_tools],
                )
            )

            candidate = response.candidates[0].content
            tool_calls = [p for p in candidate.parts if p.function_call is not None]
            text_parts = [p.text for p in candidate.parts if hasattr(p, "text") and p.text]

            if tool_calls:
                gemini_history.append(types.Content(role="model", parts=candidate.parts))
                result_parts = []
                for part in tool_calls:
                    fn_name = part.function_call.name
                    fn_args = dict(part.function_call.args)
                    try:
                        result = tools_map[fn_name](**fn_args)
                    except Exception:
                        result = {"status": "error"}
                    self._handle_tool(fn_name, fn_args)
                    result_parts.append(types.Part(
                        function_response=types.FunctionResponse(name=fn_name, response=result)
                    ))
                gemini_history.append(types.Content(role="user", parts=result_parts))
                continue
            else:
                final_text = clean_response("\n".join(text_parts))
                if not final_text:
                    final_text = random.choice(FALLBACK_RESPONSES)
                self.history.append({"role": "assistant", "content": final_text})
                return final_text

    def _run_groq(self) -> str:
        messages = [{"role": "system", "content": self.system_prompt}]
        for entry in self.history:
            if entry.get("content"):
                role = entry["role"] if entry["role"] in ["user", "assistant"] else "user"
                messages.append({"role": role, "content": str(entry["content"])})

        while True:
            response = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                tools=GROQ_TOOL_DEFINITIONS,
                tool_choice="auto",
                max_tokens=2048
            )

            message = response.choices[0].message
            tool_calls = message.tool_calls

            if tool_calls:
                messages.append({
                    "role": "assistant",
                    "content": message.content or "",
                    "tool_calls": [{"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}} for tc in tool_calls]
                })
                for tc in tool_calls:
                    fn_name = tc.function.name
                    try:
                        fn_args = json.loads(tc.function.arguments)
                        result = tools_map[fn_name](**fn_args)
                    except Exception:
                        result = {"status": "error"}
                        fn_args = {}
                    self._handle_tool(fn_name, fn_args)
                    messages.append({"role": "tool", "tool_call_id": tc.id, "content": json.dumps(result)})
                continue
            else:
                final_text = clean_response(message.content or "")
                if not final_text:
                    final_text = random.choice(FALLBACK_RESPONSES)
                self.history.append({"role": "assistant", "content": final_text})
                return final_text