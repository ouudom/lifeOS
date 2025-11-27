import os
from datetime import date

from fastapi import HTTPException, status
from langchain_classic.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage

from app.core.config import settings

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
        
        # Define the prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "{system_message}"),
            ("human", "{input}"),
            MessagesPlaceholder("agent_scratchpad"),
        ])
        
        # Create the agent
        self.agent = create_tool_calling_agent(self.llm, self.tools, self.prompt)
        
        # Create the executor
        self.agent_executor = AgentExecutor(
            agent=self.agent, 
            tools=self.tools, 
            verbose=True,
            handle_parsing_errors=True
        )

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

    def _load_system_prompt(self) -> str:
        """Load the base system prompt from SYSTEM_PROMPT.md."""
        prompt_path = os.path.join(os.getcwd(), "knowledge", "SYSTEM_PROMPT.md")
        if os.path.exists(prompt_path):
            try:
                with open(prompt_path, "r") as f:
                    return f.read().strip()
            except Exception as e:
                print(f"Error reading SYSTEM_PROMPT.md: {e}")
        
        # Fallback if file doesn't exist
        return "You are a helpful assistant."

    async def generate_content(self, prompt: str) -> str:
        """
        Process a message using the LangChain agent with tools.
        """

        knowledge_context = self._load_knowledge()
        base_prompt = self._load_system_prompt()
        
        system_prompt = (
            f"{base_prompt}\n\n"
            f"{knowledge_context}"
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=prompt)
        ]
        
        try:
            # Execute agent
            result = await self.agent_executor.ainvoke({
                "system_message": system_prompt,
                "input": prompt
            })
            
            final_content = result["output"]


                
            return str(final_content)

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing request: {str(e)}",
            )
