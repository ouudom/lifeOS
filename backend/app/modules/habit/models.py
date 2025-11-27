from datetime import datetime, date as dt_date
from typing import List, Optional, Any
from sqlmodel import Field, SQLModel, Relationship, UniqueConstraint
from sqlalchemy import Column, JSON

class Habit(SQLModel, table=True):
    __tablename__ = "habits"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, nullable=False)
    
    entries: List["HabitEntry"] = Relationship(back_populates="habit")

class HabitEntry(SQLModel, table=True):
    __tablename__ = "habit_entries"
    __table_args__ = (UniqueConstraint("habit_id", "date"),)
    
    id: Optional[int] = Field(default=None, primary_key=True)
    habit_id: int = Field(foreign_key="habits.id")
    date: dt_date = Field(nullable=False)
    value: dict = Field(default={}, sa_column=Column(JSON, nullable=False))
    
    habit: Habit = Relationship(back_populates="entries")


