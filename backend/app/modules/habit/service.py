from datetime import date
from typing import List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.habit.models import Habit, HabitEntry

async def get_habit_id(db: AsyncSession, name: str) -> int:
    statement = select(Habit).where(Habit.name == name)
    result = await db.exec(statement)
    habit = result.first()
    
    if not habit:
        habit = Habit(name=name)
        db.add(habit)
        await db.commit()
        await db.refresh(habit)
    
    return habit.id

async def upsert_habit_entry(db: AsyncSession, habit_id: int, date: date, value: dict) -> HabitEntry:
    statement = select(HabitEntry).where(HabitEntry.habit_id == habit_id, HabitEntry.date == date)
    result = await db.exec(statement)
    entry = result.first()
    
    if entry:
        entry.value = value
        db.add(entry)
    else:
        entry = HabitEntry(habit_id=habit_id, date=date, value=value)
        db.add(entry)
        
    await db.commit()
    await db.refresh(entry)
    return entry

async def get_today_habits(db: AsyncSession) -> List[HabitEntry]:
    today = date.today()
    statement = select(HabitEntry).where(HabitEntry.date == today)
    result = await db.exec(statement)
    return result.all()

async def get_habits(db: AsyncSession) -> List[Habit]:
    statement = select(Habit)
    result = await db.exec(statement)
    return result.all()
