// TanStack Query hooks. Components call these; caching/refetch handled here.
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as api from "../services/api";
import type { EmployeeInput, EmployeeQuery } from "../types";

export function useEmployees(query: EmployeeQuery) {
  return useQuery({
    queryKey: ["employees", query],
    queryFn: () => api.listEmployees(query),
    // keep showing the previous page while the next one loads (smooth paging)
    placeholderData: (prev) => prev,
  });
}

export function useEmployee(id: number | null) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => api.getEmployee(id as number),
    enabled: id != null,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["filterOptions"],
    queryFn: api.getFilterOptions,
    staleTime: Infinity,
  });
}

function useInvalidateEmployees() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["employees"] });
    qc.invalidateQueries({ queryKey: ["summary"] });
    qc.invalidateQueries({ queryKey: ["byDepartment"] });
    qc.invalidateQueries({ queryKey: ["byCountry"] });
    qc.invalidateQueries({ queryKey: ["distribution"] });
  };
}

export function useCreateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (payload: EmployeeInput) => api.createEmployee(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<EmployeeInput> }) =>
      api.updateEmployee(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteEmployee() {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (id: number) => api.deleteEmployee(id),
    onSuccess: invalidate,
  });
}

// ---- analytics -----------------------------------------------------------
export const useSummary = () =>
  useQuery({ queryKey: ["summary"], queryFn: api.getSummary });

export const useByDepartment = () =>
  useQuery({ queryKey: ["byDepartment"], queryFn: api.getByDepartment });

export const useByCountry = () =>
  useQuery({ queryKey: ["byCountry"], queryFn: api.getByCountry });

export const useDistribution = (buckets = 8) =>
  useQuery({
    queryKey: ["distribution", buckets],
    queryFn: () => api.getDistribution(buckets),
  });

export const useTopPaid = (limit = 10, order: "asc" | "desc" = "desc") =>
  useQuery({
    queryKey: ["topPaid", limit, order],
    queryFn: () => api.getTopPaid(limit, order),
  });

// ---- insights ------------------------------------------------------------
export function useAskInsight() {
  return useMutation({ mutationFn: (q: string) => api.askInsight(q) });
}
