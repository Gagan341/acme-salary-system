import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import StatCard from "../components/StatCard";
import { renderWithProviders } from "./test-utils";

describe("StatCard", () => {
  it("renders title and value", () => {
    renderWithProviders(<StatCard title="Total Employees" value="10,000" />);
    expect(screen.getByText("Total Employees")).toBeInTheDocument();
    expect(screen.getByText("10,000")).toBeInTheDocument();
  });

  it("shows a skeleton (no value) while loading", () => {
    renderWithProviders(<StatCard title="Payroll" value="$1M" loading />);
    expect(screen.getByText("Payroll")).toBeInTheDocument();
    expect(screen.queryByText("$1M")).not.toBeInTheDocument();
  });
});
