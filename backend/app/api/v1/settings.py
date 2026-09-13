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


def _ensure_user(db: Session, user_id: str) -> UserModel:
    """Ensure a user row exists; return the UserModel instance."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        user = UserModel(id=user_id)
        db.add(user)
        db.flush()
    return user


@router.post("/keys")
def save_vault_key(payload: VaultKeysUpdate, db: Session = Depends(get_db)):
    """Vaults target credentials cleanly behind symmetric encryption blocks."""
    _ensure_user(db, payload.user_id)

    settings_rec = db.query(UserSettingsModel).filter(
        UserSettingsModel.user_id == payload.user_id
    ).first()
    if not settings_rec:
        settings_rec = UserSettingsModel(id=str(uuid.uuid4()), user_id=payload.user_id)
        db.add(settings_rec)
        db.flush()

    current_keys = decrypt_api_keys(settings_rec.encrypted_keys)
    current_keys[payload.provider.lower()] = payload.api_key

    settings_rec.encrypted_keys = encrypt_api_keys(current_keys)
    db.commit()
    db.refresh(settings_rec)
    return {"status": "success", "message": f"Provider API key for '{payload.provider}' updated."}


@router.post("/update")
def update_preferences(payload: SettingsUpdateRequest, db: Session = Depends(get_db)):
    """Modifies default active routing layers securely."""
    _ensure_user(db, payload.user_id)

    settings_rec = db.query(UserSettingsModel).filter(
        UserSettingsModel.user_id == payload.user_id
    ).first()
    if not settings_rec:
        settings_rec = UserSettingsModel(
            id=str(uuid.uuid4()),
            user_id=payload.user_id,
            default_provider=payload.default_provider.lower(),
            default_model=payload.default_model,
        )
        db.add(settings_rec)
    else:
        settings_rec.default_provider = payload.default_provider.lower()
        settings_rec.default_model = payload.default_model

    db.commit()
    db.refresh(settings_rec)
    return {"status": "success", "message": "Global execution parameters applied."}


@router.get("/{user_id}")
def get_user_settings(user_id: str, db: Session = Depends(get_db)):
    """Fetches user preferences and reports which provider API keys are configured (vaulted) securely."""
    settings_rec = db.query(UserSettingsModel).filter(
        UserSettingsModel.user_id == user_id
    ).first()

    # Initialize defaults if settings record does not exist yet
    default_provider = "ollama"
    default_model = "qwen2.5-coder"
    vault_status = {
        "openai": False,
        "gemini": False,
        "openrouter": False,
    }

    if settings_rec:
        default_provider = settings_rec.default_provider or "ollama"
        default_model = settings_rec.default_model or "qwen2.5-coder"
        try:
            keys = decrypt_api_keys(settings_rec.encrypted_keys)
            for provider_name in vault_status.keys():
                if keys.get(provider_name):
                    vault_status[provider_name] = True
        except Exception:
            pass  # Suppress recovery/cipher errors gracefully

    return {
        "status": "success",
        "data": {
            "default_provider": default_provider,
            "default_model": default_model,
            "vault_status": vault_status,
        },
    }
