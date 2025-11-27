from datetime import date, timedelta
from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.modules.plan.models import Plan

async def upsert_plan(db: AsyncSession, date: date, tasks: List[str]) -> Plan:
    statement = select(Plan).where(Plan.date == date)
    result = await db.exec(statement)
    plan = result.first()
    
    if plan:
        plan.tasks = tasks
        db.add(plan)
    else:
        plan = Plan(date=date, tasks=tasks)
        db.add(plan)
        
    await db.commit()
    await db.refresh(plan)
    return plan

async def get_yesterday_plan(db: AsyncSession) -> Optional[Plan]:
    yesterday = date.today() - timedelta(days=1)
    statement = select(Plan).where(Plan.date == yesterday)
    result = await db.exec(statement)
    return result.first()
