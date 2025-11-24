from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.db import sync_engine, async_engine
from app.core.exceptions import add_exception_handlers
from sqlmodel import SQLModel
from app.modules.chat.router import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup: Create tables
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    # Shutdown: Close engine
    await async_engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Exception Handlers
add_exception_handlers(app)

# Include Routers
app.include_router(chat_router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
