"""Application settings, loaded from environment variables (never hard-coded secrets)."""
from __future__ import annotations

from datetime import datetime
from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(REPO_ROOT / ".env"), env_file_encoding="utf-8", extra="ignore"
    )

    environment: str = "development"
    log_level: str = "INFO"

    database_url: str = "postgresql+psycopg://sentinelflow:sentinelflow_dev@localhost:5433/sentinelflow"

    jwt_secret: str = Field(min_length=24)
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480

    cors_origins: str = "http://localhost:3000"

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3:8b"
    ollama_fallback_model: str = "llama3.1:8b"
    ollama_timeout_seconds: float = 30.0

    seed_user_password: str = "SentinelDemo#2026"
    data_as_of: datetime = datetime(2026, 10, 7, 23, 59, 59)

    rate_limit_per_minute: int = 240
    login_rate_limit_per_minute: int = 10
    max_request_bytes: int = 1_048_576

    @field_validator("log_level")
    @classmethod
    def _upper(cls, value: str) -> str:
        return value.upper()

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
