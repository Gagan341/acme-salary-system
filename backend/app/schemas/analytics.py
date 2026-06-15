"""Schemas for analytics dashboards and AI insight responses."""
from pydantic import BaseModel


class SummaryStats(BaseModel):
    total_employees: int
    total_payroll_usd: float
    average_salary_usd: float
    median_salary_usd: float
    highest_salary_usd: float
    lowest_salary_usd: float


class GroupStat(BaseModel):
    """A single row in a 'by department' or 'by country' breakdown."""
    name: str
    headcount: int
    average_salary_usd: float
    total_payroll_usd: float


class HistogramBucket(BaseModel):
    label: str
    min_usd: float
    max_usd: float
    count: int


class EmployeeBrief(BaseModel):
    employee_id: str
    name: str
    department: str
    country: str
    designation: str
    salary: float
    currency: str
    salary_usd: float


class InsightQuery(BaseModel):
    question: str


class InsightResponse(BaseModel):
    interpreted: str            # human-readable restatement of what we understood
    sql_explanation: str        # the SQL-like operation we ran
    result_type: str            # "scalar" | "table" | "message"
    columns: list[str] = []
    rows: list[list] = []
    message: str | None = None
