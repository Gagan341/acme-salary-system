import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useByCountry,
  useByDepartment,
  useDistribution,
} from "../hooks/useEmployees";
import { compactUsd, number, usd } from "../services/format";

const COLORS = [
  "#3949ab", "#5c6bc0", "#00897b", "#26a69a",
  "#7e57c2", "#ab47bc", "#42a5f5", "#ef5350",
];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card sx={{ height: 380 }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height="88%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function Analytics() {
  const dist = useDistribution(10);
  const depts = useByDepartment();
  const countries = useByCountry();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analytics
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Salaries normalized to USD for cross-country comparison.
      </Typography>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Salary Distribution (histogram)">
            <BarChart data={dist.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" fontSize={10} interval={0} angle={-30} textAnchor="end" height={64} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v: number) => [`${v}`, "Employees"]} />
              <Bar dataKey="count" fill="#3949ab" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Average Salary by Department">
            <BarChart data={depts.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={10} interval={0} angle={-25} textAnchor="end" height={64} />
              <YAxis tickFormatter={(v) => compactUsd(v)} fontSize={11} />
              <Tooltip formatter={(v: number) => [usd(v), "Avg salary"]} />
              <Bar dataKey="average_salary_usd" radius={[4, 4, 0, 0]}>
                {(depts.data ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Average Salary by Country">
            <BarChart data={countries.data ?? []} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => compactUsd(v)} fontSize={11} />
              <YAxis type="category" dataKey="name" width={80} fontSize={12} />
              <Tooltip formatter={(v: number) => [usd(v), "Avg salary"]} />
              <Bar dataKey="average_salary_usd" radius={[0, 4, 4, 0]}>
                {(countries.data ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Headcount by Department">
            <PieChart>
              <Pie
                data={depts.data ?? []}
                dataKey="headcount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={(p) => `${p.name}: ${number(p.headcount as number)}`}
              >
                {(depts.data ?? []).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(v: number) => [number(v), "Employees"]} />
            </PieChart>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
