from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from app.agent import Agent
from app.storage import Storage


app = FastAPI(title="Gift List Agent API", version="1.0")

# Enable CORS for local & deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In prod: replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = Agent()
storage = Storage("gift-list-data")

def get_user_id_from_iap(iap_jwt: str = Header(None, alias="x-goog-authenticated-user-id")):
    """
    Extracts user email from IAP JWT header.
    For local testing, returns a dummy user.
    """
    if not iap_jwt:
        return "testuser@example.com"
    return iap_jwt.split(":")[-1]


@app.post("/api/query")
async def query(payload: dict, request: Request, x_iap=Header(None, alias="x-goog-authenticated-user-id")):
    user_id = get_user_id_from_iap(x_iap)
    text = payload.get("text")
    if not text:
        raise HTTPException(400, detail="Missing 'text' in request")

    try:
        result = await agent.handle(text, user_id)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}
