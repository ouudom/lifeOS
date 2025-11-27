from datetime import datetime
from typing import Optional, Any
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, JSON, Text

class Message(SQLModel, table=True):
    __tablename__ = "messages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    role: str = Field(sa_column_kwargs={"check_constraint": "role IN ('user', 'assistant')"})
    content: str = Field(sa_column=Column(Text, nullable=False))
    extra: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
