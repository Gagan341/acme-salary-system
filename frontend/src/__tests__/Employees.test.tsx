import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";

vi.mock("../hooks/useEmployees", () => ({
  useEmployees: () => ({
    isFetching: false,
    data: {
      items: [
        {
          id: 1, employee_id: "ACME-000001", first_name: "Ada", last_name: "Lovelace",
          email: "ada@acme.com", department: "Engineering", designation: "Senior Engineer",
          country: "UK", currency: "GBP", salary: 90000, joining_date: "2020-01-15",
          employment_status: "active", manager_name: "C. Babbage",
          created_at: "", updated_at: "",
        },
      ],
      total: 1, page: 1, page_size: 20, total_pages: 1,
    },
  }),
  useFilterOptions: () => ({
    data: { departments: ["Engineering"], countries: ["UK"], statuses: ["active"] },
  }),
  useCreateEmployee: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateEmployee: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteEmployee: () => ({ mutate: vi.fn(), isPending: false }),
}));

import Employees from "../pages/Employees";

describe("Employees", () => {
  it("renders header, add button and an employee row", () => {
    renderWithProviders(<Employees />);
    expect(screen.getByRole("heading", { name: "Employees" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add employee/i })).toBeInTheDocument();
    expect(screen.getByText("ACME-000001")).toBeInTheDocument();
  });
});
