"""Pydantic v2 schemas: request validation + response serialization."""
from datetime import date, datetime
from decimal import Decimal
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field

DEPARTMENTS = ["Engineering", "Product", "HR", "Finance", "Marketing", "Sales", "Operations"]
COUNTRIES = ["India", "USA", "UK", "Germany", "Singapore"]
STATUSES = ["active", "on_leave", "terminated"]


class EmployeeBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    department: str
    designation: str = Field(min_length=1, max_length=100)
    country: str
    currency: str = Field(min_length=3, max_length=3)
    salary: Decimal = Field(gt=0)
    joining_date: date
    employment_status: str = "active"
    manager_name: str = Field(min_length=1, max_length=200)


class EmployeeCreate(EmployeeBase):
    # employee_id is optional on create; service generates one if omitted.
    employee_id: str | None = None


class EmployeeUpdate(BaseModel):
    """All fields optional so callers can PATCH-style send partial updates."""
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    department: str | None = None
    designation: str | None = None
    country: str | None = None
    currency: str | None = None
    salary: Decimal | None = Field(default=None, gt=0)
    joining_date: date | None = None
    employment_status: str | None = None
    manager_name: str | None = None


class EmployeeRead(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: str
    created_at: datetime
    updated_at: datetime


T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    """Generic pagination envelope returned by list endpoints."""
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class FilterOptions(BaseModel):
    departments: list[str]
    countries: list[str]
    statuses: list[str]
