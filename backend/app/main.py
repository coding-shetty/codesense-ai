from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import analyze, settings, repo, history
from app.config import settings as app_settings
from app.db.base import init_db

app = FastAPI(
    title="CodeSense AI Engine Services",
    version="1.1.0",
    description="Deterministic Static Analysis and Adaptive Multi-LLM Streaming Code Review Backend.",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Use explicit, configurable origins instead of wildcard "*".
allowed_origins = [o.strip() for o in app_settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Optional API auth middleware ───────────────────────────────────────────────
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    """
    Lightweight bearer-token gate.
    If API_AUTH_TOKEN is set, every request (except /health and /docs) must carry
    ``Authorization: Bearer <token>``.  If the env var is empty the gate is open.
    """
    # Allow unauthenticated access to health check and OpenAPI docs
    open_paths = {"/health", "/docs", "/openapi.json", "/redoc"}
    if app_settings.API_AUTH_TOKEN and request.url.path not in open_paths:
        auth_header = request.headers.get("authorization", "")
        if not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
        token = auth_header[7:].strip()
        if token != app_settings.API_AUTH_TOKEN:
            raise HTTPException(status_code=403, detail="Invalid API auth token.")
    return await call_next(request)


# ── Database bootstrap ────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_db()


# ── Routes ────────────────────────────────────────────────────────────────────
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["Analysis Orchestrator"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["Configuration Vaults"])
app.include_router(repo.router, prefix="/api/v1/repo", tags=["Repository Aggregators"])
app.include_router(history.router, prefix="/api/v1/history", tags=["Analysis History"])


@app.get("/health")
def verify_system_status():
    return {"status": "operational", "engine": "FastAPI Core Matrix Active"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
