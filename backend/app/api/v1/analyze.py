import json
import asyncio
import uuid
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

router = APIRouter()

class AnalysisRequest(BaseModel):
    source_code: str
    file_name: str
    mentor_mode: bool = False
    provider_override: Optional[str] = None
    user_id: Optional[str] = "default-local-user"

@router.post("/stream")
async def process_analysis_stream(request: AnalysisRequest, db: Session = Depends(get_db)):
    """
    Pipeline execution endpoint. Runs fast deterministic local processing,
    emits the results, and hands off context cleanly into the downstream AI stream.
    """
    if not request.source_code.strip():
        raise HTTPException(status_code=400, detail="Empty source payload context rejected.")

    # 1. Immediate local computation tasks
    complexity = calculate_cyclomatic_complexity(request.source_code)
    vulnerabilities = scan_security_and_smells(request.source_code)
    ast_structure = parse_ast_structural_signatures(request.source_code)
    
    # 2. Extract context signature details 
    language_info = detect_language_with_confidence(request.source_code, request.file_name)
    ext = language_info.get("language", "plaintext")

    async def event_generator():
        # Yield metadata frames first
        yield f"event: structural_metrics\ndata: {json.dumps({'complexity': complexity, 'findings': vulnerabilities, 'ast_structure': ast_structure, 'inferred_type': ext})}\n\n"
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
            # Look up stored encrypted user settings
            settings_rec = db.query(UserSettingsModel).filter(UserSettingsModel.user_id == request.user_id).first()
            db_encrypted_settings = settings_rec.encrypted_keys if settings_rec else "{}"
            
            # Select model preference and active routing provider
            provider_req = request.provider_override
            if not provider_req and settings_rec and settings_rec.default_provider:
                provider_req = settings_rec.default_provider

            model_choice = settings_rec.default_model if (settings_rec and settings_rec.default_model) else "qwen2.5-coder"

            # Resolve connection paths securely
            provider, token, config = await get_llm_client_and_route(
                db_encrypted_settings=db_encrypted_settings,
                requested_provider=provider_req
            )
            
            yield f"event: status\ndata: {json.dumps({'message': f'Routing analysis through {provider}...'})}\n\n"
            
            full_ai_response = []
            async for token_chunk in stream_ai_reasoning(
                prompt=prompt_body, 
                system_prompt=system_role, 
                provider=provider, 
                api_key=token, 
                config_meta=config,
                model_choice=model_choice
            ):
                full_ai_response.append(token_chunk)
                yield f"event: ai_stream\ndata: {json.dumps({'chunk': token_chunk})}\n\n"

            # 3. Explicitly persist the successful report run in the database
            # Ensure the parent UserModel is in the DB
            user = db.query(UserModel).filter(UserModel.id == request.user_id).first()
            if not user:
                user = UserModel(id=request.user_id)
                db.add(user)
                db.commit()

            history_record = AnalysisHistoryModel(
                id=str(uuid.uuid4()),
                user_id=request.user_id,
                file_name=request.file_name,
                language=ext,
                confidence=language_info.get("confidence", 1.0),
                source_code=request.source_code,
                ast_metadata=json.dumps({'complexity': complexity, 'findings': vulnerabilities, 'ast_structure': ast_structure}),
                report_json=json.dumps({'report': "".join(full_ai_response)}),
                score_overall=max(30, 100 - complexity.get('cyclomatic_complexity', 0))
            )
            db.add(history_record)
            db.commit()
                
        except Exception as e:
            yield f"event: system_error\ndata: {json.dumps({'detail': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")