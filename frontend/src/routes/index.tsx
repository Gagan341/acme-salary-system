import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import EmployeeDetails from "../pages/EmployeeDetails";
import Analytics from "../pages/Analytics";
import AIInsights from "../pages/AIInsights";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/:id" element={<EmployeeDetails />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="insights" element={<AIInsights />} />
      </Route>
    </Routes>
  );
}
