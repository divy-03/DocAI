from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    client_url: str
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    gemini_api_key: str

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
