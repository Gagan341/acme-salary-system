// Shared types mirroring the FastAPI/Pydantic response shapes.

export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  designation: string;
  country: string;
  currency: string;
  salary: number;
  joining_date: string;
  employment_status: string;
  manager_name: string | null;
  created_at: string;
  updated_at: string;
}

export type EmployeeInput = Omit<
  Employee,
  "id" | "employee_id" | "created_at" | "updated_at"
> & { employee_id?: string };

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SummaryStats {
  total_employees: number;
  total_payroll_usd: number;
  average_salary_usd: number;
  median_salary_usd: number;
  highest_salary_usd: number;
  lowest_salary_usd: number;
}

export interface GroupStat {
  name: string;
  headcount: number;
  average_salary_usd: number;
  total_payroll_usd: number;
}

export interface HistogramBucket {
  label: string;
  min_usd: number;
  max_usd: number;
  count: number;
}

export interface EmployeeBrief {
  employee_id: string;
  name: string;
  department: string;
  country: string;
  designation: string;
  salary: number;
  currency: string;
  salary_usd: number;
}

export interface InsightResponse {
  interpreted: string;
  sql_explanation: string;
  result_type: "scalar" | "table" | "message";
  columns: string[];
  rows: (string | number)[][];
  message: string | null;
}

export interface FilterOptions {
  departments: string[];
  countries: string[];
  statuses: string[];
}

export interface EmployeeQuery {
  page: number;
  page_size: number;
  search?: string;
  country?: string;
  department?: string;
  status?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}
