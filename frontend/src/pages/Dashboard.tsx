import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PaymentsIcon from "@mui/icons-material/Payments";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "../components/StatCard";
import { useByDepartment, useDistribution, useSummary } from "../hooks/useEmployees";
import { compactUsd, number, usd } from "../services/format";

const BARS = ["#3949ab", "#5c6bc0", "#00897b", "#26a69a", "#7e57c2", "#ab47bc", "#42a5f5"];

export default function Dashboard() {
  const summary = useSummary();
  const dist = useDistribution(8);
  const depts = useByDepartment();

  const s = summary.data;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Organization-wide compensation overview. All monetary values normalized to USD.
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Employees"
            value={s ? number(s.total_employees) : "—"}
            icon={<GroupsIcon />}
            loading={summary.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Payroll"
            value={s ? compactUsd(s.total_payroll_usd) : "—"}
            icon={<PaymentsIcon />}
            color="#00897b"
            loading={summary.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Average Salary"
            value={s ? usd(s.average_salary_usd) : "—"}
            icon={<TrendingUpIcon />}
            color="#7e57c2"
            loading={summary.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Median Salary"
            value={s ? usd(s.median_salary_usd) : "—"}
            icon={<ShowChartIcon />}
            color="#ed6c02"
            loading={summary.isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 380 }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Salary Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart data={dist.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" fontSize={11} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v: number) => [`${v} employees`, "Count"]} />
                  <Bar dataKey="count" fill="#3949ab" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 380 }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Department Payroll
              </Typography>
              <ResponsiveContainer width="100%" height="88%">
                <BarChart
                  data={depts.data ?? []}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => compactUsd(v)} fontSize={11} />
                  <YAxis type="category" dataKey="name" width={90} fontSize={12} />
                  <Tooltip formatter={(v: number) => [usd(v), "Payroll"]} />
                  <Bar dataKey="total_payroll_usd" radius={[0, 4, 4, 0]}>
                    {(depts.data ?? []).map((_, i) => (
                      <Cell key={i} fill={BARS[i % BARS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
