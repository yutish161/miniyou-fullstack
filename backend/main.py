from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.github import fetch_repo_structure
from backend.agent import agent

import re, json

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "MiniYou backend is live 🚀"}

class RepoRequest(BaseModel):
    repo_url: str

@app.post("/analyze")
async def analyze(payload: RepoRequest):
    files = fetch_repo_structure(payload.repo_url)

    result = await agent.run({
        "repo_structure": files
    })

    raw = str(result)

    match = re.search(r"output='(.*)'", raw, re.DOTALL)

    if not match:
        return {"error": "Could not extract output"}

    json_str = match.group(1)
    json_str = json_str.encode().decode("unicode_escape")

    return json.loads(json_str)
