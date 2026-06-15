"""Service layer for employees: business rules sit here, not in the API routes.

Responsibilities:
  * generate the human-facing employee_id
  * enforce uniqueness (email / employee_id) with friendly errors
  * orchestrate the repository
"""
from app.models.employee import Employee
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


class ConflictError(Exception):
    """Raised when a unique constraint would be violated (mapped to HTTP 409)."""


class NotFoundError(Exception):
    """Raised when a requested employee does not exist (mapped to HTTP 404)."""


class EmployeeService:
    def __init__(self, repo: EmployeeRepository):
        self.repo = repo

    def _next_employee_id(self) -> str:
        # Simple monotonic scheme: ACME-<count+1 zero padded>.
        return f"ACME-{self.repo.count() + 1:06d}"

    def get(self, emp_id: int) -> Employee:
        emp = self.repo.get_by_id(emp_id)
        if not emp:
            raise NotFoundError(f"Employee {emp_id} not found")
        return emp

    def create(self, data: EmployeeCreate) -> Employee:
        if self.repo.get_by_email(data.email):
            raise ConflictError(f"Email {data.email} already exists")

        employee_id = data.employee_id or self._next_employee_id()
        if self.repo.get_by_employee_id(employee_id):
            raise ConflictError(f"employee_id {employee_id} already exists")

        emp = Employee(
            employee_id=employee_id,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            department=data.department,
            designation=data.designation,
            country=data.country,
            currency=data.currency.upper(),
            salary=data.salary,
            joining_date=data.joining_date,
            employment_status=data.employment_status,
            manager_name=data.manager_name,
        )
        return self.repo.add(emp)

    def update(self, emp_id: int, data: EmployeeUpdate) -> Employee:
        emp = self.get(emp_id)
        payload = data.model_dump(exclude_unset=True)

        new_email = payload.get("email")
        if new_email and new_email != emp.email:
            existing = self.repo.get_by_email(new_email)
            if existing and existing.id != emp.id:
                raise ConflictError(f"Email {new_email} already exists")

        if "currency" in payload and payload["currency"]:
            payload["currency"] = payload["currency"].upper()

        for key, value in payload.items():
            setattr(emp, key, value)
        return self.repo.update(emp)

    def delete(self, emp_id: int) -> None:
        emp = self.get(emp_id)
        self.repo.delete(emp)
