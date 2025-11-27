import os
from datetime import date

from fastapi import HTTPException, status
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage

from app.core.config import settings
from app.core.db import async_session
from app.modules.chat import service as chat_service
from .tools import (
    save_habits, save_journal, get_context, save_tomorrow_plan
)

class GeminiService:
    def __init__(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GEMINI_API_KEY not configured in environment variables",
            )

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=api_key,
            temperature=0.7,
        )
        
        self.tools = [
            save_habits, save_journal, get_context, save_tomorrow_plan
        ]
        
        self.llm_with_tools = self.llm.bind_tools(self.tools)

    def _load_knowledge(self) -> str:
        """Load content from specific knowledge files."""
        knowledge_dir = os.path.join(os.getcwd(), "knowledge")
        files_to_read = [
            "GOAL.md",
            "DAILY_REVIEW_TEMPLATE.md",
            "CORE_PRINCIPLES_PROTOCOL.md",
            "IDENTITY.md"
        ]
        
        knowledge_content = []
        for filename in files_to_read:
            file_path = os.path.join(knowledge_dir, filename)
            if os.path.exists(file_path):
                try:
                    with open(file_path, "r") as f:
                        content = f.read()
                        knowledge_content.append(f"--- {filename} ---\n{content}\n")
                except Exception as e:
                    print(f"Error reading knowledge file {filename}: {e}")
        
        if not knowledge_content:
            return ""
            
        return "\n\n" + "\n".join(knowledge_content)

    async def generate_content(self, prompt: str) -> str:
        """
        Process a message using the LangChain agent with tools.
        """
        # Save user message
        async with async_session() as session:
            await chat_service.save_message(session, role="user", content=prompt)

        knowledge_context = self._load_knowledge()
        
        system_prompt = (
            "You are LifeOS — a disciplined, identity-driven personal operating agent.\n"
            "Your behavior is governed by the knowledge files:\n"
            "GOAL.md, DAILY_REVIEW_TEMPLATE.md, CORE_PRINCIPLES_PROTOCOL.md, IDENTITY.md.\n\n"
            "Read these files. Do not restate them. Do not summarize them unless the user asks. "
            "They define your identity, principles, constraints, and operating rules.\n\n"
            "Your tasks:\n"
            "- Guide daily review (habits + journal).\n"
            "- Plan tomorrow based on context.\n"
            "- Enforce identity-first behavior and eliminate overthinking, perfectionism, procrastination, and fear-driven avoidance.\n"
            "- Use tools only when saving or retrieving structured data.\n"
            "- Keep responses clear, actionable, and aligned with the user's long-term goals."
            f"{knowledge_context}"
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=prompt)
        ]
        
        try:
            # First call to LLM
            response = await self.llm_with_tools.ainvoke(messages)
            messages.append(response)
            
            final_content = response.content
            
            # If the LLM wants to use tools
            if response.tool_calls:
                for tool_call in response.tool_calls:
                    # Find the tool function
                    selected_tool = next((t for t in self.tools if t.name == tool_call["name"]), None)
                    if selected_tool:
                        # Execute the tool
                        tool_output = await selected_tool.invoke(tool_call["args"])
                        # Add tool output to messages
                        messages.append(ToolMessage(content=str(tool_output), tool_call_id=tool_call["id"]))
                
                # Second call to LLM to generate final response based on tool outputs
                final_response = await self.llm_with_tools.ainvoke(messages)
                final_content = final_response.content
            
            # Save assistant response
            async with async_session() as session:
                await chat_service.save_message(session, role="assistant", content=str(final_content))
                
            return str(final_content)

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing request: {str(e)}",
            )
