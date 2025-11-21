from app.modules.gemini.service import GeminiService


class ChatService:
    def __init__(self):
        # self.session = session
        self.gemini_service = GeminiService()

    async def get_reply(self, message: str) -> str:
        """Generate a reply using the Gemini AI service."""
        reply = await self.gemini_service.generate_content(message)
        return reply
