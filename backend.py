from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
from groq import Groq

client = Groq(api_key=os.getenv("groq_api_key"))

app = FastAPI()

# -------------------------
# CONFIG
# -------------------------

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
# groq CALL
# -------------------------
def get_response(prompt):
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are a helpful study assistant. Explain clearly and simply."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {e}"

# -------------------------
# API ROUTE
# -------------------------
@app.post("/chat")
def chat(req: ChatRequest):
    system_msg = PERSONALITIES.get(req.personality, PERSONALITIES["study"])

    prompt = build_prompt(req.history, req.message, system_msg)

    answer = get_response(prompt)

    return {
        "answer": answer
    }