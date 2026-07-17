import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CodeSense AI"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./codesense.db")
    # A 32-byte URL-safe base64 key for symmetric encryption via Fernet
    ENCRYPTION_SECRET_KEY: str = os.getenv("ENCRYPTION_SECRET_KEY", "b'7365637265745f6b65795f6d7573745f62655f33325f62797465733d'")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

    class Config:
        case_sensitive = True

settings = Settings()