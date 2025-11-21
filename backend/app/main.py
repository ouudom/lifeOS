from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.core.db import engine
from app.core.exceptions import add_exception_handlers
from sqlmodel import SQLModel
from app.modules.chat.router import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    # Shutdown: Close engine
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Add Exception Handlers
add_exception_handlers(app)

# Include Routers
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
