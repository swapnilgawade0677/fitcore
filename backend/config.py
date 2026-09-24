from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "FitCore"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    database_url: str = ("postgresql+asyncpg://postgres:postgres@localhost:5432/gym_db")

    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

if settings.database_url.startswith("postgres://"):
    settings.database_url = settings.database_url.replace(
        "postgres://",
        "postgresql+asyncpg://",
        1,
)
elif settings.database_url.startswith("postgresql://"):
    settings.database_url = settings.database_url.replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1,
)
