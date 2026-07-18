import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.models import UserSettingsModel, UserModel
from app.core.security import encrypt_api_keys, decrypt_api_keys
from app.db.base import get_db

router = APIRouter()

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
    # Ensure user exists in the DB to satisfy foreign key constraints
    user = db.query(UserModel).filter(UserModel.id == payload.user_id).first()
    if not user:
        user = UserModel(id=payload.user_id)
        db.add(user)
        db.commit()

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
    # Ensure user exists in the DB to satisfy foreign key constraints
    user = db.query(UserModel).filter(UserModel.id == payload.user_id).first()
    if not user:
        user = UserModel(id=payload.user_id)
        db.add(user)
        db.commit()

    settings_rec = db.query(UserSettingsModel).filter(UserSettingsModel.user_id == payload.user_id).first()
    if not settings_rec:
        # Create settings profile if missing instead of throwing 404
        settings_rec = UserSettingsModel(
            id=str(uuid.uuid4()), 
            user_id=payload.user_id,
            default_provider=payload.default_provider.lower(),
            default_model=payload.default_model
        )
        db.add(settings_rec)
    else:
        settings_rec.default_provider = payload.default_provider.lower()
        settings_rec.default_model = payload.default_model
    
    db.commit()
    return {"status": "success", "message": "Global execution parameters applied."}