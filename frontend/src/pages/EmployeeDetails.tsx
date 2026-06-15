import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { useEmployee } from "../hooks/useEmployees";
import { local, usd } from "../services/format";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Grid>
  );
}

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: e, isLoading, isError } = useEmployee(id ? Number(id) : null);

  if (isLoading)
    return (
      <Box sx={{ display: "grid", placeItems: "center", height: 300 }}>
        <CircularProgress />
      </Box>
    );

  if (isError || !e)
    return (
      <Box>
        <Typography color="error">Employee not found.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/employees")}>
          Back
        </Button>
      </Box>
    );

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/employees")}
        sx={{ mb: 2 }}
      >
        Back to employees
      </Button>

      <Card sx={{ maxWidth: 720 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5">
                {e.first_name} {e.last_name}
              </Typography>
              <Typography color="text.secondary">
                {e.designation} · {e.department}
              </Typography>
            </Box>
            <Chip
              label={e.employment_status.replace("_", " ")}
              color={e.employment_status === "active" ? "success" : "default"}
            />
          </Stack>

          <Divider sx={{ my: 2.5 }} />

          <Grid container spacing={2.5}>
            <Field label="Employee ID" value={e.employee_id} />
            <Field label="Email" value={e.email} />
            <Field label="Country" value={e.country} />
            <Field label="Currency" value={e.currency} />
            <Field label="Salary (local)" value={local(e.salary, e.currency)} />
            <Field label="Joining date" value={e.joining_date} />
            <Field label="Manager" value={e.manager_name ?? "—"} />
            <Field label="Department" value={e.department} />
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
