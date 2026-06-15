import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";

const mutate = vi.fn();
let mockState: { data: unknown; isPending: boolean; isError: boolean } = {
  data: null,
  isPending: false,
  isError: false,
};

vi.mock("../hooks/useEmployees", () => ({
  useAskInsight: () => ({ ...mockState, mutate }),
}));

import AIInsights from "../pages/AIInsights";

describe("AIInsights", () => {
  it("submits a question when an example chip is clicked", () => {
    renderWithProviders(<AIInsights />);
    fireEvent.click(screen.getByText("How many employees are in Sales?"));
    expect(mutate).toHaveBeenCalledWith("How many employees are in Sales?");
  });

  it("renders a scalar result with the SQL explanation", async () => {
    mockState = {
      isPending: false,
      isError: false,
      data: {
        interpreted: "Headcount in Sales.",
        sql_explanation: "SELECT COUNT(*) FROM employees WHERE department = 'Sales';",
        result_type: "scalar",
        columns: ["Headcount"],
        rows: [[1430]],
        message: "Sales has 1430 employees.",
      },
    };
    renderWithProviders(<AIInsights />);
    await waitFor(() =>
      expect(screen.getByText("Headcount in Sales.")).toBeInTheDocument(),
    );
    expect(screen.getByText(/Sales has 1430 employees/)).toBeInTheDocument();
  });
});
