"""Initial schema — users, user_settings, analysis_history

Revision ID: 001_initial
Revises: None
Create Date: 2026-09-14
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("email", sa.String(), unique=True, index=True, nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "user_settings",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True),
        sa.Column("default_provider", sa.String(), default="ollama"),
        sa.Column("default_model", sa.String(), default="qwen2.5-coder"),
        sa.Column("encrypted_keys", sa.Text(), default="{}"),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_table(
        "analysis_history",
        sa.Column("id", sa.String(), primary_key=True, index=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("file_name", sa.String(), nullable=False),
        sa.Column("language", sa.String(), nullable=False),
        sa.Column("confidence", sa.Float(), default=1.0),
        sa.Column("source_code", sa.Text(), nullable=False),
        sa.Column("ast_metadata", sa.Text(), default="{}"),
        sa.Column("report_json", sa.Text(), default="{}"),
        sa.Column("score_overall", sa.Integer(), default=70),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("analysis_history")
    op.drop_table("user_settings")
    op.drop_table("users")
