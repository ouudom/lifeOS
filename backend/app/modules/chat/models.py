from datetime import datetime
from typing import Optional
from sqlmodel import Field
from sqlalchemy import CheckConstraint, Column
from sqlalchemy.dialects.postgresql import JSON
from app.core.db import Base


class Message(Base, table=True):
    """Message model for storing chat messages."""

    __tablename__ = "messages"
    __table_args__ = (CheckConstraint("role IN ('user', 'assistant')", name="check_role"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    role: str = Field(..., description="Role of the message sender")
    content: str = Field(..., description="Message content")
    message_metadata: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSON, nullable=True),
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)
