import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
  useFilterOptions,
  useUpdateEmployee,
} from "../hooks/useEmployees";
import EmployeeFormDialog from "../components/EmployeeFormDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import { formatApiError } from "../services/api";
import { local } from "../services/format";
import type { Employee, EmployeeInput } from "../types";

const STATUS_COLOR: Record<string, "success" | "warning" | "default"> = {
  active: "success",
  on_leave: "warning",
  terminated: "default",
};

export default function Employees() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [sort, setSort] = useState<GridSortModel>([
    { field: "employee_id", sort: "asc" },
  ]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const options = useFilterOptions();
  const create = useCreateEmployee();
  const update = useUpdateEmployee();
  const remove = useDeleteEmployee();

  const query = useMemo(
    () => ({
      page: pagination.page + 1, // DataGrid is 0-based; API is 1-based
      page_size: pagination.pageSize,
      search: search || undefined,
      country: country || undefined,
      department: department || undefined,
      status: status || undefined,
      sort_by: sort[0]?.field ?? "employee_id",
      sort_dir: (sort[0]?.sort ?? "asc") as "asc" | "desc",
    }),
    [pagination, search, country, department, status, sort],
  );

  const { data, isFetching } = useEmployees(query);

  const columns: GridColDef<Employee>[] = [
    { field: "employee_id", headerName: "ID", width: 120 },
    {
      field: "name",
      headerName: "Name",
      width: 180,
      sortable: false,
      valueGetter: (_v, row) => `${row.first_name} ${row.last_name}`,
    },
    { field: "department", headerName: "Department", width: 130 },
    { field: "designation", headerName: "Designation", width: 170 },
    { field: "country", headerName: "Country", width: 110 },
    {
      field: "salary",
      headerName: "Salary",
      width: 140,
      renderCell: (p) => local(p.row.salary, p.row.currency),
    },
    {
      field: "employment_status",
      headerName: "Status",
      width: 120,
      renderCell: (p) => (
        <Chip
          size="small"
          label={p.row.employment_status.replace("_", " ")}
          color={STATUS_COLOR[p.row.employment_status] ?? "default"}
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (p) => (
        <Stack direction="row">
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(`/employees/${p.row.id}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => {
                setEditing(p.row);
                setFormError(null);
                setFormOpen(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleting(p.row)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const submit = (payload: EmployeeInput) => {
    setFormError(null);
    const onError = (e: unknown) => setFormError(formatApiError(e));
    if (editing) {
      update.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setFormOpen(false), onError },
      );
    } else {
      create.mutate(payload, { onSuccess: () => setFormOpen(false), onError });
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Typography variant="h4">Employees</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditing(null);
            setFormError(null);
            setFormOpen(true);
          }}
        >
          Add Employee
        </Button>
      </Stack>

      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Search name / email / ID"
            size="small"
            fullWidth
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 0 }));
            }}
          />
          <TextField
            select
            label="Country"
            size="small"
            sx={{ minWidth: 150 }}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {(options.data?.countries ?? []).map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Department"
            size="small"
            sx={{ minWidth: 160 }}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {(options.data?.departments ?? []).map((d) => (
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Status"
            size="small"
            sx={{ minWidth: 150 }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {(options.data?.statuses ?? []).map((s) => (
              <MenuItem key={s} value={s}>
                {s.replace("_", " ")}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Card>

      <Card sx={{ height: 620 }}>
        <DataGrid
          rows={data?.items ?? []}
          columns={columns}
          getRowId={(r) => r.id}
          rowCount={data?.total ?? 0}
          loading={isFetching}
          paginationMode="server"
          sortingMode="server"
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          sortModel={sort}
          onSortModelChange={setSort}
          pageSizeOptions={[10, 20, 50, 100]}
          disableRowSelectionOnClick
          disableColumnFilter
          sx={{ border: 0 }}
        />
      </Card>

      <EmployeeFormDialog
        open={formOpen}
        employee={editing}
        options={options.data}
        onClose={() => setFormOpen(false)}
        onSubmit={submit}
        saving={create.isPending || update.isPending}
        error={formError}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete employee"
        message={`Delete ${deleting?.first_name} ${deleting?.last_name}? This cannot be undone.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
      />
    </Box>
  );
}
