import json
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.engines.complexity import calculate_cyclomatic_complexity
from app.engines.static_analyzer import scan_security_and_smells
from app.core.llm import get_llm_client_and_route, stream_ai_reasoning

router = APIRouter()

class AnalysisRequest(BaseModel):
    source_code: str
    file_name: str
    mentor_mode: bool = False
from typing import Optional
provider_override: Optional[str] = None

@router.post("/stream")
async def process_analysis_stream(request: AnalysisRequest):
    """
    Pipeline execution endpoint. Runs fast deterministic local processing,
    emits the results, and hands off context cleanly into the downstream AI stream.
    """
    if not request.source_code.strip():
        raise HTTPException(status_code=400, detail="Empty source payload context rejected.")

    # 1. Immediate local computation tasks
    complexity = calculate_cyclomatic_complexity(request.source_code)
    vulnerabilities = scan_security_and_smells(request.source_code)
    
    # 2. Extract context signature details 
    ext = request.file_name.split('.')[-1] if '.' in request.file_name else 'unknown'

    async def event_generator():
        # Yield metadata frames first
        yield f"event: structural_metrics\ndata: {json.dumps({'complexity': complexity, 'findings': vulnerabilities, 'inferred_type': ext})}\n\n"
        await asyncio.sleep(0.1) # Smooth frame buffer separation

        # Assemble prompt text enriched with metadata
        system_role = (
            "You are an elite Staff Software Architect using absolute precision. "
            "Examine code structural breakdowns, diagnose errors, design patterns, "
            "and output production-optimized structural iterations instantly."
        )
        if request.mentor_mode:
            system_role += " Operate in Mentor Mode: teach the user using interactive, Socratic breakdown logic with explicit code proof paradigms."

        prompt_body = f"""
        Analyze this source payload code labeled: {request.file_name}
        
        [Pre-computed AST Local Metrics]
        - Cyclomatic Complexity Score: {complexity['cyclomatic_complexity']} ({complexity['rating']})
        - Found Deterministic Flags: {json.dumps(vulnerabilities)}
        
        [Source Input]
        ```
        {request.source_code}
        ```
        
        Provide a detailed engineering analysis covering:
        - Deep Code Explanation & Operational Workflows
        - Runtime Architecture Performance Optimization Targets
        - Refactored Clean Production Implementation
        - Comprehensive Target Unit Testing Strategy
        """

        try:
            # Resolve connection paths securely
            provider, token, config = await get_llm_client_and_route(
                db_encrypted_settings="{}", # Dynamically reads default system local settings fallback
                requested_provider=request.provider_override
            )
            
            yield f"event: status\ndata: {json.dumps({'message': f'Routing analysis through {provider}...'})}\n\n"
            
            async for token_chunk in stream_ai_reasoning(
                prompt=prompt_body, 
                system_prompt=system_role, 
                provider=provider, 
                api_key=token, 
                config_meta=config
            ):
                yield f"event: ai_stream\ndata: {json.dumps({'chunk': token_chunk})}\n\n"
                
        except Exception as e:
            yield f"event: system_error\ndata: {json.dumps({'detail': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")