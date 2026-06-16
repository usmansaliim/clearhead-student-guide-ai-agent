from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import ClearHeadAgent
from realtime.scheduler import refresher
from nust_scraper import start_background_scraper

app = Flask(__name__)
CORS(app)

# Start background scraper
start_background_scraper()

app = Flask(__name__)
CORS(app)

sessions = {}

# Start background knowledge refresher
refresher.start()

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    print("REQUEST DATA:")
    print(data)
    session_id = data.get("session_id", "default")
    user_message = data.get("message", "")
    profile = data.get("profile", {})
    image = data.get("image", None)

    if session_id not in sessions:
        sessions[session_id] = ClearHeadAgent(session_id=session_id)

    agent = sessions[session_id]

    if profile and not agent.memory.get("name"):
        agent.memory["name"] = profile.get("name")
        agent.memory["university"] = "NUST"
        agent.memory["department"] = profile.get("department")
        agent.memory["year"] = profile.get("year")
        agent.memory["semester"] = profile.get("semester")
        agent.memory["challenges"] = profile.get("challenges", [])

    if user_message == "__init__":
        response = agent.greet()
    else:
        print("IMAGE EXISTS:", image is not None)
        response = agent.chat(user_message, image=image)

    return jsonify({
        "response": response,
        "plan": agent.current_plan,
        "situation": agent.current_situation,
        "mood_history": agent.memory.get("mood_history", []),
        "is_returning": agent.is_returning,
        "name": agent.memory.get("name")
    })

@app.route("/reset", methods=["POST"])
def reset():
    data = request.json
    session_id = data.get("session_id", "default")
    if session_id in sessions:
        del sessions[session_id]
    return jsonify({"status": "reset"})

@app.route("/memory/<session_id>", methods=["GET"])
def get_memory(session_id):
    from memory import load_memory
    return jsonify(load_memory(session_id))

@app.route("/community/pulse", methods=["GET"])
def community_pulse():
    from realtime.community_fetcher import get_realtime_nust_pulse
    topic = request.args.get("topic", "student life")
    return jsonify(get_realtime_nust_pulse(topic))

@app.route("/faculty/review", methods=["GET"])
def faculty_review():
    from realtime.community_fetcher import get_faculty_review
    name = request.args.get("name", "")
    course = request.args.get("course", "")
    return jsonify(get_faculty_review(name, course))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)