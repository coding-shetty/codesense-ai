import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.models import UserSettingsModel, UserModel
from app.core.security import encrypt_api_keys, decrypt_api_keys

router = APIRouter()

# Global Mock Database Session Helper (Swap out with Engine SessionLocal dependency in Production)
def get_db():
    raise NotImplementedError("Bind your active SQLAlchemy engine session provider here.")

class VaultKeysUpdate(BaseModel):
    user_id: str
    provider: str
    api_key: str

class SettingsUpdateRequest(BaseModel):
    user_id: str
    default_provider: str
    default_model: str

@router.post("/keys")
async def save_vault_key(payload: VaultKeysUpdate, db: Session = Depends(get_db)):
    """Vaults target credentials cleanly behind asymmetric encryption blocks."""
    settings_rec = db.query(UserSettingsModel).filter(UserSettingsModel.user_id == payload.user_id).first()
    if not settings_rec:
        settings_rec = UserSettingsModel(id=str(uuid.uuid4()), user_id=payload.user_id)
        db.add(settings_rec)
    
    current_keys = decrypt_api_keys(settings_rec.encrypted_keys)
    current_keys[payload.provider.lower()] = payload.api_key
    
    settings_rec.encrypted_keys = encrypt_api_keys(current_keys)
    db.commit()
    return {"status": "success", "message": f"Provider API key for key '{payload.provider}' updated."}

@router.post("/update")
async def update_preferences(payload: SettingsUpdateRequest, db: Session = Depends(get_db)):
    """Modifies default active routing layers securely."""
    settings_rec = db.query(UserSettingsModel).filter(UserSettingsModel.user_id == payload.user_id).first()
    if not settings_rec:
        raise HTTPException(status_code=404, detail="Settings profile context registry missing.")
        
    settings_rec.default_provider = payload.default_provider.lower()
    settings_rec.default_model = payload.default_model
    db.commit()
    return {"status": "success", "message": "Global execution parameters applied."}