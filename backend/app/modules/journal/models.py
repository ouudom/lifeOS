from datetime import datetime, date as dt_date
from typing import Optional, Any
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, JSON, Text

class DailyJournal(SQLModel, table=True):
    __tablename__ = "daily_journal"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    date: dt_date = Field(unique=True, nullable=False)
    text: Optional[str] = Field(default=None, sa_column=Column(Text))
    meta: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)


