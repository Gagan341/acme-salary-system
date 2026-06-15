// Central API client. All HTTP lives here so components/hooks stay declarative.
import axios from "axios";
import type {
  Employee,
  EmployeeBrief,
  EmployeeInput,
  EmployeeQuery,
  FilterOptions,
  GroupStat,
  HistogramBucket,
  InsightResponse,
  Page,
  SummaryStats,
} from "../types";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const http = axios.create({ baseURL, timeout: 30000 });

// ---- employees -----------------------------------------------------------
export async function listEmployees(q: EmployeeQuery): Promise<Page<Employee>> {
  const params: Record<string, unknown> = {
    page: q.page,
    page_size: q.page_size,
    sort_by: q.sort_by,
    sort_dir: q.sort_dir,
  };
  if (q.search) params.search = q.search;
  if (q.country) params.country = q.country;
  if (q.department) params.department = q.department;
  if (q.status) params.status = q.status;
  const { data } = await http.get<Page<Employee>>("/employees", { params });
  return data;
}

export async function getEmployee(id: number): Promise<Employee> {
  const { data } = await http.get<Employee>(`/employees/${id}`);
  return data;
}

export async function createEmployee(payload: EmployeeInput): Promise<Employee> {
  const { data } = await http.post<Employee>("/employees", payload);
  return data;
}

export async function updateEmployee(
  id: number,
  payload: Partial<EmployeeInput>,
): Promise<Employee> {
  const { data } = await http.put<Employee>(`/employees/${id}`, payload);
  return data;
}

export async function deleteEmployee(id: number): Promise<void> {
  await http.delete(`/employees/${id}`);
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const { data } = await http.get<FilterOptions>("/employees/filters");
  return data;
}

// ---- analytics -----------------------------------------------------------
export async function getSummary(): Promise<SummaryStats> {
  const { data } = await http.get<SummaryStats>("/analytics/summary");
  return data;
}

export async function getByDepartment(): Promise<GroupStat[]> {
  const { data } = await http.get<GroupStat[]>("/analytics/departments");
  return data;
}

export async function getByCountry(): Promise<GroupStat[]> {
  const { data } = await http.get<GroupStat[]>("/analytics/countries");
  return data;
}

export async function getDistribution(buckets = 8): Promise<HistogramBucket[]> {
  const { data } = await http.get<HistogramBucket[]>("/analytics/distribution", {
    params: { buckets },
  });
  return data;
}

export async function getTopPaid(
  limit = 10,
  order: "asc" | "desc" = "desc",
): Promise<EmployeeBrief[]> {
  const { data } = await http.get<EmployeeBrief[]>("/analytics/top", {
    params: { limit, order },
  });
  return data;
}

// ---- insights ------------------------------------------------------------
export async function askInsight(question: string): Promise<InsightResponse> {
  const { data } = await http.post<InsightResponse>("/insights/query", {
    question,
  });
  return data;
}
