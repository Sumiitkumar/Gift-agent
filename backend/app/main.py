from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.agent import Agent

app = FastAPI()
agent = Agent()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/query")
async def query(request: Request):
    body = await request.json()
    text = body.get("text", "")
    user = body.get("user_id", "default_user")

    result = await agent.handle(text, user)

    return {"success": True, "result": result}
