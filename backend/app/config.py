import os
import secrets
from pydantic_settings import BaseSettings


def _resolve_encryption_key() -> str:
    """Resolve the Fernet encryption key from environment, or generate a throwaway one for dev."""
    key = os.getenv("ENCRYPTION_SECRET_KEY", "").strip()
    if key:
        return key
    # Auto-generate a key for local development so the hardcoded default is never shipped.
    # In production the env var MUST be set explicitly — generated keys are ephemeral.
    print(
        "[config] WARNING: ENCRYPTION_SECRET_KEY is not set. "
        "Generating a temporary key — encrypted values will NOT survive a restart. "
        "Set ENCRYPTION_SECRET_KEY in your .env for persistent encryption."
    )
    from cryptography.fernet import Fernet
    return Fernet.generate_key().decode()


class Settings(BaseSettings):
    PROJECT_NAME: str = "CodeSense AI"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./codesense.db")
    ENCRYPTION_SECRET_KEY: str = _resolve_encryption_key()
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

    # Comma-separated list of allowed CORS origins (e.g. "http://localhost:3000,https://app.example.com")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000")

    # Simple shared API token for lightweight auth (set via env to protect endpoints)
    API_AUTH_TOKEN: str = os.getenv("API_AUTH_TOKEN", "")

    class Config:
        case_sensitive = True


settings = Settings()
