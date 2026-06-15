import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import type { Employee, EmployeeInput, FilterOptions } from "../types";

interface Props {
  open: boolean;
  employee: Employee | null; // null => create mode
  options: FilterOptions | undefined;
  onClose: () => void;
  onSubmit: (payload: EmployeeInput) => void;
  saving?: boolean;
  error?: string | null;
}

const CURRENCY_BY_COUNTRY: Record<string, string> = {
  India: "INR",
  USA: "USD",
  UK: "GBP",
  Germany: "EUR",
  Singapore: "SGD",
};

const empty: EmployeeInput = {
  first_name: "",
  last_name: "",
  email: "",
  department: "Engineering",
  designation: "",
  country: "USA",
  currency: "USD",
  salary: 0,
  joining_date: new Date().toISOString().slice(0, 10),
  employment_status: "active",
  manager_name: "",
};

export default function EmployeeFormDialog({
  open,
  employee,
  options,
  onClose,
  onSubmit,
  saving,
  error,
}: Props) {
  const [form, setForm] = useState<EmployeeInput>(empty);

  useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        country: employee.country,
        currency: employee.currency,
        salary: employee.salary,
        joining_date: employee.joining_date,
        employment_status: employee.employment_status,
        manager_name: employee.manager_name ?? "",
      });
    } else {
      setForm(empty);
    }
  }, [employee, open]);

  const set = (key: keyof EmployeeInput, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onCountry = (country: string) =>
    setForm((f) => ({
      ...f,
      country,
      currency: CURRENCY_BY_COUNTRY[country] ?? f.currency,
    }));

  const departments = options?.departments ?? ["Engineering"];
  const countries = options?.countries ?? ["USA"];
  const statuses = options?.statuses ?? ["active"];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="First name"
                fullWidth
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Last name"
                fullWidth
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Department"
                fullWidth
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
              >
                {departments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Designation"
                fullWidth
                value={form.designation}
                onChange={(e) => set("designation", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Country"
                fullWidth
                value={form.country}
                onChange={(e) => onCountry(e.target.value)}
              >
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Currency"
                fullWidth
                value={form.currency}
                onChange={(e) => set("currency", e.target.value.toUpperCase())}
                inputProps={{ maxLength: 3 }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Salary"
                type="number"
                fullWidth
                value={form.salary}
                onChange={(e) => set("salary", Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Joining date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.joining_date}
                onChange={(e) => set("joining_date", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Status"
                fullWidth
                value={form.employment_status}
                onChange={(e) => set("employment_status", e.target.value)}
              >
                {statuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Manager name"
                fullWidth
                value={form.manager_name ?? ""}
                onChange={(e) => set("manager_name", e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(form)}
          disabled={saving}
        >
          {employee ? "Save changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
