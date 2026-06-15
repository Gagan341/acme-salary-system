"""FastAPI application entrypoint.

On startup we ensure tables exist (create_all). In production with Alembic you
would run migrations instead, but create_all keeps the unzip-and-run path
working even if migrations haven't been applied yet. It is a no-op when the
schema already exists.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analytics, employees, insights
from app.config import settings
from app.db.base import Base
from app.db.session import engine

# Importing the model registers it on Base.metadata for create_all.
from app.models.employee import Employee  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)
app.include_router(insights.router, prefix=settings.api_prefix)


@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok", "service": settings.app_name}


@app.get("/", tags=["meta"])
def root() -> dict:
    return {"message": "ACME Salary Management API", "docs": "/docs"}
