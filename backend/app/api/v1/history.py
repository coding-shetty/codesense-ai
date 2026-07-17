from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.db.models import AnalysisHistoryModel

router = APIRouter()

@router.get("/{user_id}")
async def get_user_history(user_id: str, limit: int = 10, db: Session = Depends(get_db)):
    """Fetches the past analysis history for the user's dashboard."""
    history = db.query(AnalysisHistoryModel)\
                .filter(AnalysisHistoryModel.user_id == user_id)\
                .order_by(AnalysisHistoryModel.created_at.desc())\
                .limit(limit)\
                .all()
    
    if not history:
        return {"status": "empty", "data": []}
        
    return {
        "status": "success",
        "data": [
            {
                "id": record.id,
                "file_name": record.file_name,
                "language": record.language,
                "score": record.score_overall,
                "date": record.created_at.isoformat()
            } for record in history
        ]
    }