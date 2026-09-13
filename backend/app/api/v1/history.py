from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.db.models import AnalysisHistoryModel

router = APIRouter()


@router.get("/{user_id}")
def get_user_history(
    user_id: str,
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Fetches the past analysis history for the user's dashboard."""
    history = (
        db.query(AnalysisHistoryModel)
        .filter(AnalysisHistoryModel.user_id == user_id)
        .order_by(AnalysisHistoryModel.created_at.desc())
        .limit(limit)
        .all()
    )

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
                "date": record.created_at.isoformat() if record.created_at else None,
            }
            for record in history
        ],
    }
