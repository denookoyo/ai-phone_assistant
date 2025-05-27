from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from responder import get_ai_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow frontend dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store chat history per session (in-memory for now)
chat_history = []

class Prompt(BaseModel):
    prompt: str

@app.post("/ask")
async def ask(prompt: Prompt):
    chat_history.append({"role": "user", "content": prompt.prompt})
    response = get_ai_response(chat_history)
    chat_history.append({"role": "assistant", "content": response})
    return {"response": response}
