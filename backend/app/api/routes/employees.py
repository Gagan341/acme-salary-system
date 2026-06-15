"""Employee endpoints: list (paginated/filtered/sorted) + full CRUD."""
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_employee_service
from app.schemas.employee import (
    COUNTRIES,
    DEPARTMENTS,
    STATUSES,
    EmployeeCreate,
    EmployeeRead,
    EmployeeUpdate,
    FilterOptions,
    Page,
)
from app.services.employee_service import (
    ConflictError,
    EmployeeService,
    NotFoundError,
)

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/filters", response_model=FilterOptions)
def filter_options() -> FilterOptions:
    """Static lists used to populate the frontend filter dropdowns."""
    return FilterOptions(departments=DEPARTMENTS, countries=COUNTRIES, statuses=STATUSES)


@router.get("", response_model=Page[EmployeeRead])
def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    country: str | None = None,
    department: str | None = None,
    status: str | None = None,
    sort_by: str = "employee_id",
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    service: EmployeeService = Depends(get_employee_service),
) -> Page[EmployeeRead]:
    items, total = service.repo.list(
        page=page, page_size=page_size, search=search, country=country,
        department=department, status=status, sort_by=sort_by, sort_dir=sort_dir,
    )
    total_pages = (total + page_size - 1) // page_size
    return Page[EmployeeRead](
        items=items, total=total, page=page,
        page_size=page_size, total_pages=total_pages,
    )


@router.get("/{emp_id}", response_model=EmployeeRead)
def get_employee(
    emp_id: int, service: EmployeeService = Depends(get_employee_service)
) -> EmployeeRead:
    try:
        return service.get(emp_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.post("", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate, service: EmployeeService = Depends(get_employee_service)
) -> EmployeeRead:
    try:
        return service.create(payload)
    except ConflictError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc


@router.put("/{emp_id}", response_model=EmployeeRead)
def update_employee(
    emp_id: int,
    payload: EmployeeUpdate,
    service: EmployeeService = Depends(get_employee_service),
) -> EmployeeRead:
    try:
        return service.update(emp_id, payload)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc


@router.delete("/{emp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    emp_id: int, service: EmployeeService = Depends(get_employee_service)
) -> None:
    try:
        service.delete(emp_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
