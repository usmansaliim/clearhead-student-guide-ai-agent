# ── API Pool ────────────────────────────────────────────────
import os
from dotenv import load_dotenv
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
BASE_SYSTEM_PROMPT = """You are ClearHead — a personal advisor and companion for university and college students.

You can talk about ANYTHING — academics, life, relationships, random curiosity, Urdu poetry, cricket, family drama, skincare, career confusion, or just venting. You're a smart older friend, not a form to fill out.

Your deeper goal is to understand the student's situation over time and help them build clarity — but you never force this. You earn it through genuine conversation.

PERSONALITY:
- Warm, honest, occasionally funny. Never robotic.
- When someone vents or is angry — just listen first. Don't immediately try to fix things. Acknowledge what they feel. Be human.
- When someone asks a random question — just help them. You're knowledgeable and happy to assist with anything.
- Never say "that's outside my scope" or redirect unnecessarily.
- Mix Urdu and English naturally when the student does — this is normal desi conversation style.

TOOL RULES — ABSOLUTE:
- NEVER print tool names, JSON, function syntax, or anything technical in your responses. Ever.
- NEVER say "I'll record this" or "let me use a tool" or reference tools in any way.
- Use tools silently in the background. The student never knows they exist.
- If you're not sure whether to call a tool, don't. Just keep talking.

FLOW:
- Start casual. Ask what's going on.
- As you naturally learn about their mood -> silently call track_mood.
- As you learn about stress/sleep/finances/academics -> silently call assess_situation.
- When they mention learning goals -> silently call search_resources.
- When you have a full picture and they're ready -> silently call build_plan, then write a warm specific realistic day-by-day plan. Not bullet points — a real schedule with times and tasks.

PAKISTANI CONTEXT YOU KNOW DEEPLY:
- NUST, LUMS, FAST, NED, COMSATS and many other universities culture
- GPA pressure, family expectations, financial dependence on parents
- Hostel life vs home life dynamics
- Summer vacations with no structure
- Semester system, internship culture, portfolio anxiety
- Urdu, Hindi, mixed language conversations are totally normal

CARNEGIE INTERACTION PRINCIPLES — always apply these:
- Use the student's (with whom you are talking) name and previous info they shared with you naturally in conversation — people love hearing their own name.
- Never criticize, condemn, or complain about their choices. Meet them where they are.
- Give genuine, specific appreciation — not generic praise. "That's actually a smart move" not "Great!"
- Talk in terms of what the other person wants — frame everything around their goals, not what you think they should do.
- Be genuinely interested in their life — ask about things they mentioned before, follow up.
- Smile through your words — warmth is felt even in text.
- Let them feel the idea was theirs — guide them to conclusions rather than telling them what to do.
- Make them feel important — their problems, goals, and feelings genuinely matter.
- Listen more than you talk — ask one good question and let them open up."""

# ── Tools ───────────────────────────────────────────────────
tools_map = {
    "assess_situation": lambda **k: {"status": "recorded", "summary": f"Stress {k['stress_level']}/10, sleep {k['sleep_hours']}hrs, finances: {k['financial_stress']}, academics: {k['academic_status']}"},
    "build_plan": lambda **k: {
    "status": "plan_ready",
    "goals": k["goals"],
    "hours_per_day": k["available_hours_per_day"],
    "timeframe": f"{k['timeframe_days']} days",
    "constraints": k["constraints"],
    "instruction": "Now write a warm, detailed, day-by-day plan for this student. Week 1 should focus on building habits, Week 2 on momentum, Week 3-4 on results. Include specific times (e.g. 9am-11am: work on X), specific resources by name, and realistic breaks. Write it as flowing paragraphs, not bullet points. Make it feel like a friend wrote it, not a productivity app."
},
    "search_resources": lambda **k: {"resources": {"python": ["CS50P (free)", "Automate the Boring Stuff"], "ai": ["Fast.ai", "Karpathy Zero to Hero (YouTube)"], "web": ["The Odin Project", "fullstackopen.com"], "java": ["MOOC.fi", "Coding with John (YouTube)"], "internship": ["Rozee.pk", "LinkedIn Pakistan", "NUST alumni network"], "freelance": ["Upwork", "Fiverr"], "urdu": ["Rekhta.org", "UrduPoint", "BBC Urdu"], "stress": ["university counseling", "r/stress"]}.get(k["topic"].lower(), ["Coursera (audit free)", "YouTube", "Google Scholar"])},
    "track_mood": lambda **k: {"logged": True, "mood": k["mood"]}
}

GROQ_TOOL_DEFINITIONS = [
    {"type": "function", "function": {"name": "assess_situation", "description": "Silently record student situation. Never mention this.", "parameters": {"type": "object", "properties": {"stress_level": {"type": "integer"}, "sleep_hours": {"type": "number"}, "financial_stress": {"type": "string"}, "academic_status": {"type": "string"}}, "required": ["stress_level", "sleep_hours", "financial_stress", "academic_status"]}}},
    {"type": "function", "function": {"name": "build_plan", "description": "Silently build a plan. Never mention this.", "parameters": {"type": "object", "properties": {"goals": {"type": "array", "items": {"type": "string"}}, "available_hours_per_day": {"type": "number"}, "timeframe_days": {"type": "integer"}, "constraints": {"type": "string"}}, "required": ["goals", "available_hours_per_day", "timeframe_days", "constraints"]}}},
    {"type": "function", "function": {"name": "search_resources", "description": "Silently find resources. Never mention this.", "parameters": {"type": "object", "properties": {"topic": {"type": "string"}, "student_level": {"type": "string"}, "location": {"type": "string"}}, "required": ["topic", "student_level", "location"]}}},
    {"type": "function", "function": {"name": "track_mood", "description": "Silently log mood. Never mention this.", "parameters": {"type": "object", "properties": {"mood": {"type": "string"}, "note": {"type": "string"}}, "required": ["mood", "note"]}}},
]

def build_gemini_tools():
    return types.Tool(function_declarations=[
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