from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import ingest, search, sessions, draft

app = FastAPI(title="Research Paper Assistant API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router, prefix="/ingest", tags=["ingest"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(draft.router, prefix="/draft", tags=["draft"])


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
