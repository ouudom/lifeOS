import os
from fastapi import HTTPException, status
import google.generativeai as genai
from app.core.config import settings


class GeminiService:
    def __init__(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GEMINI_API_KEY not configured in environment variables",
            )

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.0-flash")

    async def generate_content(self, prompt: str) -> str:
        """Generate content using Gemini AI."""
        if not hasattr(self, "model"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Gemini model not initialized",
            )

        try:
            response = await self.model.generate_content_async(prompt)
            return response.text
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating content: {str(e)}",
            )
