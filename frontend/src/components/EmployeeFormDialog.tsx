import { useEffect, useState, type FormEvent } from "react";
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

type FieldErrors = Partial<Record<keyof EmployeeInput, string>>;

function validateForm(form: EmployeeInput): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.first_name.trim()) errors.first_name = "First name is required";
  if (!form.last_name.trim()) errors.last_name = "Last name is required";

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (!form.department) errors.department = "Department is required";
  if (!form.designation.trim()) errors.designation = "Designation is required";
  if (!form.country) errors.country = "Country is required";

  if (!form.currency.trim()) {
    errors.currency = "Currency is required";
  } else if (form.currency.trim().length !== 3) {
    errors.currency = "Currency must be a 3-letter code";
  }

  if (!form.salary || form.salary <= 0) {
    errors.salary = "Salary must be greater than 0";
  }

  if (!form.joining_date) errors.joining_date = "Joining date is required";
  if (!form.employment_status) errors.employment_status = "Status is required";
  if (!form.manager_name?.trim()) errors.manager_name = "Manager name is required";

  return errors;
}

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
    setFieldErrors({});
  }, [employee, open]);

  const set = (key: keyof EmployeeInput, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const onCountry = (country: string) =>
    setForm((f) => ({
      ...f,
      country,
      currency: CURRENCY_BY_COUNTRY[country] ?? f.currency,
    }));

  const departments = options?.departments ?? ["Engineering"];
  const countries = options?.countries ?? ["USA"];
  const statuses = options?.statuses ?? ["active"];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    onSubmit({
      ...form,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      designation: form.designation.trim(),
      currency: form.currency.trim().toUpperCase(),
      manager_name: form.manager_name!.trim(),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="First name"
                fullWidth
                required
                value={form.first_name}
                error={Boolean(fieldErrors.first_name)}
                helperText={fieldErrors.first_name}
                onChange={(e) => set("first_name", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Last name"
                fullWidth
                required
                value={form.last_name}
                error={Boolean(fieldErrors.last_name)}
                helperText={fieldErrors.last_name}
                onChange={(e) => set("last_name", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={form.email}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Department"
                fullWidth
                required
                value={form.department}
                error={Boolean(fieldErrors.department)}
                helperText={fieldErrors.department}
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
                required
                value={form.designation}
                error={Boolean(fieldErrors.designation)}
                helperText={fieldErrors.designation}
                onChange={(e) => set("designation", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Country"
                fullWidth
                required
                value={form.country}
                error={Boolean(fieldErrors.country)}
                helperText={fieldErrors.country}
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
                required
                value={form.currency}
                error={Boolean(fieldErrors.currency)}
                helperText={fieldErrors.currency}
                onChange={(e) => set("currency", e.target.value.toUpperCase())}
                inputProps={{ maxLength: 3 }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                label="Salary"
                type="number"
                fullWidth
                required
                value={form.salary > 0 ? form.salary : ""}
                error={Boolean(fieldErrors.salary)}
                helperText={fieldErrors.salary ?? "Must be greater than 0"}
                onChange={(e) =>
                  set("salary", e.target.value === "" ? 0 : Number(e.target.value))
                }
                inputProps={{ min: 1, step: 1 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Joining date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={form.joining_date}
                error={Boolean(fieldErrors.joining_date)}
                helperText={fieldErrors.joining_date}
                onChange={(e) => set("joining_date", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Status"
                fullWidth
                required
                value={form.employment_status}
                error={Boolean(fieldErrors.employment_status)}
                helperText={fieldErrors.employment_status}
                onChange={(e) => set("employment_status", e.target.value)}
              >
                {statuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Manager name"
                fullWidth
                required
                value={form.manager_name ?? ""}
                error={Boolean(fieldErrors.manager_name)}
                helperText={fieldErrors.manager_name}
                onChange={(e) => set("manager_name", e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {employee ? "Save changes" : "Create"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
