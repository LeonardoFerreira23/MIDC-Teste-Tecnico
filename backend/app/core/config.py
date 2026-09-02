from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[3]

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT_DIR / ".env", extra="ignore")

    database_url: str = "postgresql+psycopg://app:app@db:5432/indicadores"

    cors_origins: list[str] = [
        "http://localhost:4200",
        "http://localhost:5173",
    ]

    seed_data: bool = False


settings = Settings()