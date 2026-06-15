"""Shared pytest fixtures.

We run tests against an in-memory SQLite DB (StaticPool keeps one shared
connection so the schema/data persists across the session) and override the
get_db dependency. This gives fast, isolated tests with zero external services.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture()
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def sample_payload(**overrides) -> dict:
    base = {
        "first_name": "Ada",
        "last_name": "Lovelace",
        "email": "ada@acme.com",
        "department": "Engineering",
        "designation": "Senior Engineer",
        "country": "UK",
        "currency": "GBP",
        "salary": 90000,
        "joining_date": "2020-01-15",
        "employment_status": "active",
        "manager_name": "Charles Babbage",
    }
    base.update(overrides)
    return base
