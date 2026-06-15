"""Application configuration.

We read everything from environment variables (12-factor style) so the same
image runs locally, in Docker, and on Render/Railway without code changes.

DATABASE_URL controls the engine:
  - Docker / production -> a MySQL URL is injected (see docker-compose.yml)
  - Local quick start    -> defaults to SQLite so the app runs with zero setup
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "ACME Salary Management API"
    api_prefix: str = "/api"

    # Default to SQLite file so `setup.sh` works with no MySQL installed.
    # docker-compose overrides this with the MySQL connection string.
    database_url: str = "sqlite:///./acme_salary.db"

    # Comma separated list of allowed CORS origins for the React frontend.
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
