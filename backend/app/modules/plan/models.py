from datetime import datetime, date as dt_date
from typing import Optional, List, Any
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, JSON

class Plan(SQLModel, table=True):
    __tablename__ = "plans"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    date: dt_date = Field(unique=True, nullable=False)
    tasks: List[str] = Field(default=[], sa_column=Column(JSON, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow)

