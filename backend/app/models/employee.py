"""Employee ORM model.

Indexes are placed on the columns we filter, sort, and join on most often
(employee_id, department, country, salary). With 10k rows these turn full
table scans into index range scans, keeping list/analytics queries fast.
"""
from datetime import date, datetime

from sqlalchemy import DateTime, Date, Index, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # Business identifier (e.g. ACME-000123) — unique and indexed for lookup.
    employee_id: Mapped[str] = mapped_column(String(20), unique=True, index=True)

    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)

    department: Mapped[str] = mapped_column(String(50), index=True)
    designation: Mapped[str] = mapped_column(String(100))

    country: Mapped[str] = mapped_column(String(50), index=True)
    currency: Mapped[str] = mapped_column(String(3))

    # Numeric (not float) so money never suffers binary rounding errors.
    salary: Mapped[float] = mapped_column(Numeric(14, 2), index=True)

    joining_date: Mapped[date] = mapped_column(Date)
    employment_status: Mapped[str] = mapped_column(String(20), index=True, default="active")
    manager_name: Mapped[str] = mapped_column(String(200), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Composite index for the most common combined filter on the Employees page.
    __table_args__ = (
        Index("ix_emp_dept_country", "department", "country"),
    )

    def __repr__(self) -> str:  # pragma: no cover - debug helper
        return f"<Employee {self.employee_id} {self.first_name} {self.last_name}>"
