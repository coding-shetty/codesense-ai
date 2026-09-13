import json
import asyncio
import uuid
import traceback
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.db.models import UserSettingsModel, AnalysisHistoryModel, UserModel
from app.engines.complexity import calculate_cyclomatic_complexity
from app.engines.static_analyzer import scan_security_and_smells
from app.engines.ast_parser import parse_ast_structural_signatures, detect_language_with_confidence
from app.core.llm import get_llm_client_and_route, stream_ai_reasoning


async def run_local_analysis(source_code: str, file_name: str) -> dict:
    """
    Orchestrate the deterministic local analysis pipeline.
    Runs complexity analysis, AST parsing, and security scanning concurrently
    using asyncio.to_thread to avoid blocking the event loop.
    """
    complexity, vulnerabilities, ast_structure, language_info = await asyncio.gather(
        asyncio.to_thread(calculate_cyclomatic_complexity, source_code),
        asyncio.to_thread(scan_security_and_smells, source_code),
        asyncio.to_thread(parse_ast_structural_signatures, source_code),
        asyncio.to_thread(detect_language_with_confidence, source_code, file_name),
    )
    return {
        "complexity": complexity,
        "vulnerabilities": vulnerabilities,
        "ast_structure": ast_structure,
        "language_info": language_info,
    }


def compute_overall_score(complexity: dict, vulnerabilities: list) -> int:
    """Compute a multi-factor quality score from deterministic analysis results."""
    complexity_score = max(0, 100 - complexity.get("cyclomatic_complexity", 0) * 2)
    findings_penalty = len(vulnerabilities) * 5
    return max(10, min(100, complexity_score - findings_penalty))
