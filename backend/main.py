from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend.github import fetch_repo_structure
from backend.agent import agent

import os
import re, json

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Serve Frontend ----------------

FRONTEND_PATH = "../frontend"

# Serve Next.js static files
if os.path.exists(f"{FRONTEND_PATH}/.next"):
    app.mount("/_next", StaticFiles(directory=f"{FRONTEND_PATH}/.next"), name="next")

# Serve public assets
if os.path.exists(f"{FRONTEND_PATH}/public"):
    app.mount("/public", StaticFiles(directory=f"{FRONTEND_PATH}/public"), name="public")

# Root → frontend
@app.get("/")
def serve_frontend():
    return FileResponse(f"{FRONTEND_PATH}/index.html")


# ---------------- API ----------------

class RepoRequest(BaseModel):
    repo_url: str

@app.post("/analyze")
async def analyze(payload: RepoRequest):
    files = fetch_repo_structure(payload.repo_url)

    result = await agent.run({
        "repo_structure": files
    })

    raw = str(result)
    print("\nRAW LLM OUTPUT:\n", raw)

    match = re.search(r"output='(.*)'", raw, re.DOTALL)

    if not match:
        return {
            "error": "Could not extract output",
            "raw": raw
        }

    json_str = match.group(1)

    # Convert escaped JSON
    json_str = json_str.encode().decode("unicode_escape")

    try:
        parsed = json.loads(json_str)
        return parsed
    except Exception as e:
        return {
            "error": "JSON parse failed",
            "raw": json_str,
            "exception": str(e)
        }
