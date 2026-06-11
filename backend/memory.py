import json
import os
from datetime import datetime

MEMORY_DIR = "X:/clearhead/backend/memories"
os.makedirs(MEMORY_DIR, exist_ok=True)

def get_memory_path(session_id: str) -> str:
    return os.path.join(MEMORY_DIR, f"{session_id}.json")

def load_memory(session_id: str) -> dict:
    path = get_memory_path(session_id)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {
        "session_id": session_id,
        "created_at": datetime.now().isoformat(),
        "last_seen": datetime.now().isoformat(),
        "name": None,
        "university": None,
        "year": None,
        "mood_history": [],
        "situation_history": [],
        "goals": [],
        "current_plan": None,
        "conversation_summary": None,
        "visit_count": 0
    }

def save_memory(session_id: str, memory: dict):
    memory["last_seen"] = datetime.now().isoformat()
    memory["visit_count"] = memory.get("visit_count", 0) + 1
    path = get_memory_path(session_id)
    with open(path, "w") as f:
        json.dump(memory, f, indent=2)

def update_mood(memory: dict, mood: str, note: str) -> dict:
    memory["mood_history"].append({
        "mood": mood,
        "note": note,
        "timestamp": datetime.now().isoformat()
    })
    # Keep last 10 moods only
    memory["mood_history"] = memory["mood_history"][-10:]
    return memory

def update_situation(memory: dict, situation: dict) -> dict:
    memory["situation_history"].append({
        **situation,
        "timestamp": datetime.now().isoformat()
    })
    # Keep last 5 snapshots
    memory["situation_history"] = memory["situation_history"][-5:]
    return memory

def update_plan(memory: dict, plan: dict) -> dict:
    memory["current_plan"] = {
        **plan,
        "created_at": datetime.now().isoformat()
    }
    if plan.get("goals"):
        memory["goals"] = plan["goals"]
    return memory

def extract_name(text: str) -> str | None:
    """Try to extract name from intro messages."""
    import re
    patterns = [
        r"(?:i am|i'm|my name is|mera naam|naam hai)\s+([A-Za-z]+)",
        r"^([A-Za-z]+)\s+here",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            name = match.group(1)
            # Filter out common false positives
            if name.lower() not in ["a", "an", "the", "just", "also", "here", "student"]:
                return name.capitalize()
    return None

def build_memory_context(memory: dict) -> str:
    """Build a context string to inject into system prompt for returning users."""
    if memory["visit_count"] == 0:
        return ""

    parts = ["RETURNING USER CONTEXT — you already know this student:"]

    if memory["name"]:
        parts.append(f"- Name: {memory['name']}")
    if memory["university"]:
        parts.append(f"- University: {memory['university']}")
    if memory["goals"]:
        parts.append(f"- Goals: {', '.join(memory['goals'])}")
    if memory["current_plan"]:
        plan = memory["current_plan"]
        parts.append(f"- Last plan: {plan.get('timeframe_days', '?')} day plan created on {plan.get('created_at', '?')[:10]}")
    if memory["situation_history"]:
        last = memory["situation_history"][-1]
        parts.append(f"- Last situation: stress {last.get('stress_level', '?')}/10, academics: {last.get('academic_status', '?')}")
    if memory["mood_history"]:
        last_mood = memory["mood_history"][-1]
        parts.append(f"- Last mood: {last_mood['mood']} — {last_mood['note']}")
    if memory["conversation_summary"]:
        parts.append(f"- Previous conversation summary: {memory['conversation_summary']}")

    parts.append("\nGreet them like you remember them. Reference what you know naturally — don't list it all out robotically. Ask how things have been since last time.")

    return "\n".join(parts)