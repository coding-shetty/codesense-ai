from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import analyze, settings, repo, history

app = FastAPI(
    title="CodeSense AI Engine Services",
    version="1.0.0",
    description="Deterministic Static Analysis and Accelerated Multi-LLM System Core Provider Core Backend Router Engine Assembly."
)

# Cross Origin Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routing Mount Framework
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["Analysis Orchestrator"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["Configuration Vaults"])
app.include_router(repo.router, prefix="/api/v1/repo", tags=["Repository Aggregators"])
app.include_router(history.router, prefix="/api/v1/history", tags=["Analysis History"])

@app.get("/health")
def verify_system_status():
    return {"status": "operational", "engine": "FastAPI Core Matrix Active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)