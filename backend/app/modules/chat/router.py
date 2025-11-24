from fastapi import APIRouter, status, Depends, Query
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.schemas import BaseResponse
from app.modules.chat.service import ChatService
from app.core.db import get_session
from app.core.pagination import pagination_helper

router = APIRouter()


async def get_service(session: AsyncSession = Depends(get_session)) -> ChatService:
    return ChatService(session)


@router.post("/", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def chat(message: str, service: ChatService = Depends(get_service)):
    reply = await service.get_reply(message)

    return BaseResponse(
        code=status.HTTP_200_OK, 
        message="Message sent", 
        data=reply
    )


@router.get("/", response_model=BaseResponse, status_code=status.HTTP_200_OK)
async def get_messages(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    service: ChatService = Depends(get_service),
):
    skip = (page - 1) * limit
    messages, pagination_result = await service.get_messages(skip=skip, limit=limit)
    
    return BaseResponse(
        code=status.HTTP_200_OK, 
        message="Messages retrieved", 
        data=messages,
        metadata={
            "pagination": pagination_result
        }
    )
