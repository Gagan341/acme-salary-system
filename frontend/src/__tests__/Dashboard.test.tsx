import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";

// Mock the data hooks so the component renders deterministic values.
vi.mock("../hooks/useEmployees", () => ({
  useSummary: () => ({
    isLoading: false,
    data: {
      total_employees: 10000,
      total_payroll_usd: 750000000,
      average_salary_usd: 75000,
      median_salary_usd: 66000,
      highest_salary_usd: 300000,
      lowest_salary_usd: 12000,
    },
  }),
  useDistribution: () => ({ data: [{ label: "$0k-$50k", count: 3000 }] }),
  useByDepartment: () => ({
    data: [{ name: "Engineering", headcount: 1500, average_salary_usd: 95000, total_payroll_usd: 142500000 }],
  }),
}));

import Dashboard from "../pages/Dashboard";

describe("Dashboard", () => {
  it("renders the four KPI cards with values", () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText("Total Employees")).toBeInTheDocument();
    expect(screen.getByText("10,000")).toBeInTheDocument();
    expect(screen.getByText("Average Salary")).toBeInTheDocument();
    expect(screen.getByText("Median Salary")).toBeInTheDocument();
  });
});
