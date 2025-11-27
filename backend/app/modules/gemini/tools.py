from datetime import date, timedelta
from typing import List, Optional, Dict, Any
from langchain_core.tools import tool

from app.core.db import async_session
from app.modules.chat import service as chat_service
from app.modules.habit import service as habit_service
from app.modules.journal import service as journal_service
from app.modules.plan import service as plan_service

@tool
async def save_habits(habits: dict) -> str:
    """
    Store today's habit log.
    Input example:
    {
      "exercise": true,
      "meditation": true,
      "reading": { "pages": 12, "book": "Atomic Habits" },
      "sleep": { "duration": 7.2, "score": 84 },
      "water": true,
      "diet": { "no_junk": true, "no_sugar": false }
    }
    """
    try:
        async with async_session() as session:
            today = date.today()
            results = []
            for habit_name, value in habits.items():
                habit_id = await habit_service.get_habit_id(session, habit_name)
                # Normalize value to dict if it's a boolean
                if isinstance(value, bool):
                     entry_value = {"completed": value}
                elif isinstance(value, dict):
                    entry_value = value
                else:
                    entry_value = {"value": value}
                
                entry = await habit_service.upsert_habit_entry(session, habit_id, today, entry_value)
                results.append(f"Logged {habit_name}")
            return f"Habits saved: {', '.join(results)}"
    except Exception as e:
        return f"Error saving habits: {str(e)}"

@tool
async def save_journal(entry: dict) -> str:
    """
    Save today's journal.
    Input example:
    {
      "text": "Short reflection here...",
      "wins": ["win 1", "win 2"],
      "improvements": ["improvement 1"]
    }
    """
    try:
        async with async_session() as session:
            today = date.today()
            text = entry.get("text", "")
            meta = {
                "wins": entry.get("wins", []),
                "improvements": entry.get("improvements", [])
            }
            await journal_service.upsert_daily_journal(session, today, text, meta)
            return "Journal entry saved."
    except Exception as e:
        return f"Error saving journal: {str(e)}"

@tool
async def get_context(_: str = "") -> str:
    """
    Returns:
    - last 20 messages
    - today's habits
    - today's journal
    - yesterday's plan
    """
    try:
        async with async_session() as session:
            # Last 20 messages
            messages = await chat_service.get_last_messages(session, limit=20)
            messages_str = "\n".join([f"{m.role}: {m.content}" for m in messages])
            
            # Today's habits
            habits = await habit_service.get_today_habits(session)
            habits_str = str([h.model_dump() for h in habits])
            
            # Today's journal
            journal = await journal_service.get_today_journal(session)
            journal_str = journal.model_dump() if journal else "None"
            
            # Yesterday's plan
            plan = await plan_service.get_yesterday_plan(session)
            plan_str = plan.model_dump() if plan else "None"
            
            return f"""
Context:
--- Last Messages ---
{messages_str}

--- Today's Habits ---
{habits_str}

--- Today's Journal ---
{journal_str}

--- Yesterday's Plan ---
{plan_str}
"""
    except Exception as e:
        return f"Error retrieving context: {str(e)}"

@tool
async def save_tomorrow_plan(data: dict) -> str:
    """
    Input:
    {
      "tasks": ["task 1", "task 2", "task 3"]
    }
    """
    try:
        async with async_session() as session:
            tomorrow = date.today() + timedelta(days=1)
            tasks = data.get("tasks", [])
            await plan_service.upsert_plan(session, tomorrow, tasks)
            return f"Plan for {tomorrow} saved with {len(tasks)} tasks."
    except Exception as e:
        return f"Error saving plan: {str(e)}"
