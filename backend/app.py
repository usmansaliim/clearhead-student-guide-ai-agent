from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import ClearHeadAgent

app = Flask(__name__)
CORS(app)

sessions = {}

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    session_id = data.get("session_id", "default")
    user_message = data.get("message", "")

    if session_id not in sessions:
        sessions[session_id] = ClearHeadAgent(session_id=session_id)

    agent = sessions[session_id]

    if user_message == "__init__":
        response = agent.greet()
    else:
        response = agent.chat(user_message)

    return jsonify({
        "response": response,
        "plan": agent.current_plan,
        "situation": agent.current_situation,
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

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)





# Backend loading: 
# cd X:\clearhead
# venv\Scripts\activate
# cd backend
# python app.py

# front end loading:
# cd X:\clearhead\frontend
# npm run dev -- --host