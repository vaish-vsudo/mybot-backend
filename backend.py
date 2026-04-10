from fastapi import FastAPI
from pydantic import BaseModel
import requests

app = FastAPI()

# -------------------------
# CONFIG
# -------------------------
OLLAMA_API = "http://localhost:11434/api/generate"

PERSONALITIES = {
    "study": "You are a helpful study assistant. Explain step-by-step, give summaries and quizzes.",
    "exam": "You are an exam coach. Give concise answers, strategies, and practice questions.",
    "general": "You are a helpful assistant."
}

# -------------------------
# REQUEST FORMAT
# -------------------------
class ChatRequest(BaseModel):
    message: str
    history: list = []
    personality: str = "study"
    model: str = "phi3:mini"

# -------------------------
# PROMPT BUILDER
# -------------------------
def build_prompt(history, user_text, system_msg):
    dialogue = ""

    for m in history:
        if m["role"] == "user":
            dialogue += f"User: {m['content']}\n"
        elif m["role"] == "assistant":
            dialogue += f"Assistant: {m['content']}\n"

    dialogue += f"User: {user_text}\nAssistant:"

    return system_msg + "\n\n" + dialogue

# -------------------------
# OLLAMA CALL
# -------------------------
def query_ollama(prompt, model):
    payload = {
        "model": model,
        "prompt": prompt,
    }

    try:
        res = requests.post(OLLAMA_API, json={**payload, "stream": False})
        return res.json().get("response", "No response")
    except Exception as e:
        return f"Error: {e}"

# -------------------------
# API ROUTE
# -------------------------
@app.post("/chat")
def chat(req: ChatRequest):
    system_msg = PERSONALITIES.get(req.personality, PERSONALITIES["study"])

    prompt = build_prompt(req.history, req.message, system_msg)

    answer = query_ollama(prompt, req.model)

    return {
        "answer": answer
    }