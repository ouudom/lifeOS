from datetime import date
from typing import Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.journal.models import DailyJournal

async def upsert_daily_journal(db: AsyncSession, date: date, text: str, meta: dict) -> DailyJournal:
    statement = select(DailyJournal).where(DailyJournal.date == date)
    result = await db.exec(statement)
    journal = result.first()
    
    if journal:
        journal.text = text
        journal.meta = meta
        db.add(journal)
    else:
        journal = DailyJournal(date=date, text=text, meta=meta)
        db.add(journal)
        
    await db.commit()
    await db.refresh(journal)
    return journal

async def get_today_journal(db: AsyncSession) -> Optional[DailyJournal]:
    today = date.today()
    statement = select(DailyJournal).where(DailyJournal.date == today)
    result = await db.exec(statement)
    return result.first()
