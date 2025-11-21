from fastapi import APIRouter, status, Depends
from app.core.schemas import BaseResponse
from app.modules.chat.service import ChatService

router = APIRouter()


async def get_service() -> ChatService:
    return ChatService()


@router.post("/", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def chat(message: str, service: ChatService = Depends(get_service)):
    reply = await service.get_reply(message)

    return BaseResponse(code=status.HTTP_200_OK, message="Message sent", data=reply)
