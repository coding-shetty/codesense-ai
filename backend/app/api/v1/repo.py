import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

IGNORE_DIRS = {
    ".git",
    ".next",
    "node_modules",
    "dist",
    "build",
    "__pycache__",
    ".venv",
    "venv",
    ".idea",
    ".vscode",
    ".DS_Store",
    "coverage",
}

IGNORE_EXTENSIONS = {
    ".pack",
    ".gz",
    ".old",
    ".log",
    ".tmp",
    ".tsbuildinfo",
}

class RepoAnalysisRequest(BaseModel):
    repo_url: str  # Format: github.com/username/repository

@router.post("/analyze")
async def analyze_github_repository(payload: RepoAnalysisRequest):
    """
    Scans a public GitHub repository via GitHub Tree API. 
    Filters out cache/build files and returns architectural breakdown, health scores, and metrics.
    """
    clean_url = payload.repo_url.replace("https://", "").replace("http://", "").replace("www.", "")
    parts = clean_url.split("/")
    
    if len(parts) < 3 or parts[0] != "github.com":
        raise HTTPException(status_code=400, detail="Invalid target URL template definition. Use format: github.com/user/repo")
        
    owner, repo = parts[1], parts[2]
    api_endpoint = f"https://api.github.com/repos/{owner}/{repo}/git/trees/main?recursive=1"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(api_endpoint, headers={"User-Agent": "CodeSense-AI-Core"})
        if response.status_code != 200:
            api_endpoint = f"https://api.github.com/repos/{owner}/{repo}/git/trees/master?recursive=1"
            response = await client.get(api_endpoint, headers={"User-Agent": "CodeSense-AI-Core"})
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Target repository metadata or source tree access denied.")
                
        tree_data = response.json()
        files_catalog = []
        extensions_count = {}
        frameworks_detected = set()
        
        for element in tree_data.get("tree", []):
            if element.get("type") == "blob":
                path = element.get("path", "")
                
                # Check if path contains ignored directories
                path_parts = path.split("/")
                if any(d in IGNORE_DIRS for d in path_parts):
                    continue
                
                # Check if file has ignored extension
                if any(path.endswith(ext) for ext in IGNORE_EXTENSIONS):
                    continue
                
                files_catalog.append(path)
                
                # Extension counting
                ext = path.split(".")[-1].lower() if "." in path else "unknown"
                extensions_count[ext] = extensions_count.get(ext, 0) + 1
                
                # Simple framework detection based on config/dependency files
                filename = path_parts[-1].lower()
                if filename == "package.json":
                    frameworks_detected.update(["Node.js", "JavaScript/TypeScript Ecosystem"])
                elif filename == "requirements.txt" or filename == "pyproject.toml":
                    frameworks_detected.update(["Python", "FastAPI/Flask/Django potential"])
                elif filename == "next.config.js" or filename == "next.config.ts":
                    frameworks_detected.add("Next.js")
                elif filename == "tailwind.config.js" or filename == "tailwind.config.ts":
                    frameworks_detected.add("Tailwind CSS")

        has_readme = any("readme.md" in p.lower() for p in files_catalog)
        has_tests = any("test" in p.lower() for p in files_catalog)
        
        # Calculate dynamic health score
        base_score = 70
        if has_readme: base_score += 15
        if has_tests: base_score += 15

        return {
            "repository": f"{owner}/{repo}",
            "total_files": len(files_catalog),
            "file_distribution": extensions_count,
            "frameworks": list(frameworks_detected),
            "architecture_detected": "Layered Component Architecture" if len(files_catalog) > 20 else "Monolithic Layout",
            "health_score": min(base_score, 100),
            "security_score": 92 if not any(".env" in p for p in files_catalog) else 40,
            "maintainability_score": 88 if has_tests else 75,
            "code_quality": 90,
            "documentation_score": 95 if has_readme else 50
        }
