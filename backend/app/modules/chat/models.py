from datetime import datetime
from typing import Optional
from sqlmodel import Field
from sqlalchemy import CheckConstraint
from app.core.db import Base


class Message(Base, table=True):
    """Message model for storing chat messages."""

    __tablename__ = "messages"
    __table_args__ = (CheckConstraint("role IN ('user', 'ai')", name="check_role"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    role: str = Field(..., description="Role of the message sender")
    content: str = Field(..., description="Message content")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)
