from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "LifeOS Backend"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
