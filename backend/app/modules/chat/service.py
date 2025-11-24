from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, desc
from typing import List, Tuple
from app.modules.gemini.service import GeminiService
from app.modules.chat.models import Message


class ChatService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.gemini_service = GeminiService()

    async def get_reply(self, message: str) -> str:
        """Generate a reply using the Gemini AI service and store the conversation."""
        # Store user message
        user_msg = Message(role="user", content=message)
        self.session.add(user_msg)
        await self.session.commit()
        await self.session.refresh(user_msg)

        # Generate reply
        reply_content = await self.gemini_service.generate_content(message)

        # Store assistant message
        assistant_msg = Message(role="assistant", content=reply_content)
        self.session.add(assistant_msg)
        await self.session.commit()
        await self.session.refresh(assistant_msg)

        return reply_content

    async def get_messages(self, skip: int = 0, limit: int = 20) -> Tuple[List[Message], int]:
        """Retrieve messages with pagination."""
        
        query = select(Message).order_by(desc(Message.created_at)).offset(skip).limit(limit)
        result = await self.session.execute(query)
        messages = result.scalars().all()

        from sqlalchemy import func
        count_query = select(func.count()).select_from(Message)
        count_result = await self.session.execute(count_query)
        total_count = count_result.scalar()

        from app.core.pagination import pagination_helper
        
        page = (skip // limit) + 1
        pagination_result = pagination_helper(messages, page, limit, total_count)

        return messages, pagination_result
