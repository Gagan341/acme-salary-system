"""Repository layer: the ONLY place that talks to the DB for employees.

Keeping queries here (rather than in routes/services) means the business logic
and API never construct SQL directly, so we can swap the storage engine or add
caching in one place. This is the Repository Pattern the spec asks for.
"""
from __future__ import annotations

from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.orm import Session

from app.models.employee import Employee

SORTABLE_FIELDS = {
    "employee_id": Employee.employee_id,
    "first_name": Employee.first_name,
    "last_name": Employee.last_name,
    "department": Employee.department,
    "country": Employee.country,
    "salary": Employee.salary,
    "joining_date": Employee.joining_date,
}


class EmployeeRepository:
    def __init__(self, db: Session):
        self.db = db

    # ---- reads -------------------------------------------------------------
    def get_by_id(self, emp_id: int) -> Employee | None:
        return self.db.get(Employee, emp_id)

    def get_by_employee_id(self, employee_id: str) -> Employee | None:
        return self.db.scalar(
            select(Employee).where(Employee.employee_id == employee_id)
        )

    def get_by_email(self, email: str) -> Employee | None:
        return self.db.scalar(select(Employee).where(Employee.email == email))

    def _apply_filters(self, stmt, *, search, country, department, status):
        if search:
            like = f"%{search}%"
            stmt = stmt.where(
                or_(
                    Employee.first_name.ilike(like),
                    Employee.last_name.ilike(like),
                    Employee.email.ilike(like),
                    Employee.employee_id.ilike(like),
                )
            )
        if country:
            stmt = stmt.where(Employee.country == country)
        if department:
            stmt = stmt.where(Employee.department == department)
        if status:
            stmt = stmt.where(Employee.employment_status == status)
        return stmt

    def list(
        self,
        *,
        page: int = 1,
        page_size: int = 20,
        search: str | None = None,
        country: str | None = None,
        department: str | None = None,
        status: str | None = None,
        sort_by: str = "employee_id",
        sort_dir: str = "asc",
    ) -> tuple[list[Employee], int]:
        base = self._apply_filters(
            select(Employee), search=search, country=country,
            department=department, status=status,
        )

        # Count uses the same filters but no ordering/limit (fast COUNT(*)).
        total = self.db.scalar(
            select(func.count()).select_from(base.subquery())
        ) or 0

        column = SORTABLE_FIELDS.get(sort_by, Employee.employee_id)
        order = desc(column) if sort_dir == "desc" else asc(column)

        stmt = (
            base.order_by(order)
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        items = list(self.db.scalars(stmt).all())
        return items, total

    def all(self) -> list[Employee]:
        return list(self.db.scalars(select(Employee)).all())

    def count(self) -> int:
        return self.db.scalar(select(func.count()).select_from(Employee)) or 0

    # ---- writes ------------------------------------------------------------
    def add(self, employee: Employee) -> Employee:
        self.db.add(employee)
        self.db.commit()
        self.db.refresh(employee)
        return employee

    def bulk_add(self, employees: list[Employee]) -> None:
        self.db.bulk_save_objects(employees)
        self.db.commit()

    def update(self, employee: Employee) -> Employee:
        self.db.commit()
        self.db.refresh(employee)
        return employee

    def delete(self, employee: Employee) -> None:
        self.db.delete(employee)
        self.db.commit()
