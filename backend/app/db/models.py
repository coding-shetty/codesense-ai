import json
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def _utcnow() -> datetime:
    """Timezone-aware UTC now (replaces deprecated datetime.utcnow)."""
    return datetime.now(timezone.utc)


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=_utcnow)

    settings = relationship("UserSettingsModel", back_populates="user", uselist=False, cascade="all, delete-orphan")
    analyses = relationship("AnalysisHistoryModel", back_populates="user", cascade="all, delete-orphan")


class UserSettingsModel(Base):
    __tablename__ = "user_settings"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    default_provider = Column(String, default="ollama")
    default_model = Column(String, default="qwen2.5-coder")
    encrypted_keys = Column(Text, default="{}")
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    user = relationship("UserModel", back_populates="settings")


class AnalysisHistoryModel(Base):
    __tablename__ = "analysis_history"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"))
    file_name = Column(String, nullable=False)
    language = Column(String, nullable=False)
    confidence = Column(Float, default=1.0)
    source_code = Column(Text, nullable=False)
    ast_metadata = Column(Text, default="{}")
    report_json = Column(Text, default="{}")
    score_overall = Column(Integer, default=70)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("UserModel", back_populates="analyses")
