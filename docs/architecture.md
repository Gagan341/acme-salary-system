# Architecture — ACME Salary Management System

## 1. System Overview

```
┌──────────────────────┐      HTTPS/JSON       ┌───────────────────────┐
│  React 19 + MUI SPA   │ ───────────────────▶ │   FastAPI (Python 3.12) │
│  TanStack Query        │ ◀─────────────────── │   Pydantic · SQLAlchemy │
│  Recharts · Router      │     REST /api/*      │   Repository + Service  │
└──────────────────────┘                       └───────────┬───────────┘
        served by nginx                                     │ SQLAlchemy
                                                            ▼
                                                  ┌───────────────────┐
                                                  │      MySQL 8.0      │
                                                  │  employees (indexed)│
                                                  └───────────────────┘
```

The browser holds no business logic beyond presentation; all rules
(uniqueness, id generation, FX normalization, NL parsing) live in the backend
service layer so they are testable and reusable.

## 2. Backend Layering

Request flow: **Route → Service → Repository → Database**.

- **API routes** (`app/api/routes`): HTTP only — parse query params, map domain
  exceptions to status codes, serialize responses. No SQL, no business rules.
- **Services** (`app/services`): business logic. `EmployeeService` (validation,
  id generation, conflict checks), `AnalyticsService` (USD aggregates),
  `InsightsService` (rule-based NL → SQL).
- **Repositories** (`app/repositories`): the only layer that builds SQL. Swapping
  databases or adding caching touches just this layer.
- **Models** (`app/models`): SQLAlchemy ORM. **Schemas** (`app/schemas`):
  Pydantic request/response contracts.

This separation is what makes the 80% coverage target reachable: services are
unit-testable against a repository, and routes are integration-tested via the
in-memory SQLite test client.

## 3. ER Diagram

A single normalized entity is required for this domain. Reference data
(departments, countries, currencies) is a small fixed enumeration, so it is kept
as constants rather than over-normalized into lookup tables (see tradeoffs.md).

```
┌─────────────────────────────────────────────────────────┐
│                        employees                          │
├──────────────────┬──────────────┬────────────────────────┤
│ id (PK)          │ INT          │ surrogate key, auto-inc  │
│ employee_id (UQ) │ VARCHAR(20)  │ business id  ACME-000123 │  ◀ index
│ first_name       │ VARCHAR(100) │                          │
│ last_name        │ VARCHAR(100) │                          │
│ email (UQ)       │ VARCHAR(255) │                          │  ◀ index
│ department       │ VARCHAR(50)  │ enum-constrained         │  ◀ index
│ designation      │ VARCHAR(100) │                          │
│ country          │ VARCHAR(50)  │ enum-constrained         │  ◀ index
│ currency         │ CHAR(3)      │ ISO 4217 (INR/USD/…)     │
│ salary           │ DECIMAL(14,2)│ stored in local currency │  ◀ index
│ joining_date     │ DATE         │                          │
│ employment_status│ VARCHAR(20)  │ active/on_leave/terminated│ ◀ index
│ manager_name     │ VARCHAR(200) │ nullable                 │
│ created_at       │ DATETIME     │ server default now()     │
│ updated_at       │ DATETIME     │ on update now()          │
└──────────────────┴──────────────┴────────────────────────┘
Composite index: (department, country)  → ix_emp_dept_country
```

## 4. Why this scales to 10,000+ employees

- **Server-side pagination** — the API never returns more than `page_size` rows
  (max 100); the grid requests one page at a time.
- **Indexes** on `employee_id`, `email`, `department`, `country`, `salary`,
  `employment_status`, plus a composite `(department, country)` index turn the
  common filter/sort queries into index scans instead of full table scans.
- **COUNT then page** — list queries compute the filtered count and fetch only
  the current slice in two cheap queries.
- **Bulk seeding** — `bulk_save_objects` inserts 10k rows in batches of 1,000.
- TanStack Query caches and de-duplicates requests, and keeps the previous page
  visible while the next loads.

## 5. Folder Structure

```
acme-salary-system/
├── docker-compose.yml          # mysql + backend + frontend, one command
├── setup.sh / setup.bat        # no-Docker bootstrap (auto venv + npm install)
├── README.md
├── docs/                       # requirements, architecture, ai-usage, tradeoffs
├── backend/
│   ├── Dockerfile  entrypoint.sh  requirements.txt  seed.py  alembic.ini
│   ├── alembic/                # migrations (0001_initial)
│   └── app/
│       ├── main.py             # FastAPI app, CORS, router wiring
│       ├── config.py           # env-driven settings (DATABASE_URL, CORS)
│       ├── db/                 # base, engine/session factory
│       ├── models/             # SQLAlchemy Employee
│       ├── schemas/            # Pydantic contracts
│       ├── repositories/       # EmployeeRepository (all SQL)
│       ├── services/           # employee / analytics / insights / fx
│       ├── api/                # deps + routes (employees, analytics, insights)
│       └── tests/              # pytest: crud, analytics, insights
└── frontend/
    ├── Dockerfile  nginx.conf  vite.config.ts  package.json
    └── src/
        ├── main.tsx App.tsx theme.ts
        ├── types/              # TS mirrors of API shapes
        ├── services/           # axios client + formatters
        ├── hooks/              # TanStack Query hooks
        ├── layouts/            # MainLayout (sidebar)
        ├── components/         # StatCard, dialogs
        ├── pages/              # Dashboard, Employees, Details, Analytics, AIInsights
        ├── routes/             # route table
        └── __tests__/          # vitest + RTL
```

## 6. API Surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/employees` | list — page, page_size, search, country, department, status, sort_by, sort_dir |
| GET | `/api/employees/filters` | dropdown options |
| GET | `/api/employees/{id}` | single employee |
| POST | `/api/employees` | create |
| PUT | `/api/employees/{id}` | update |
| DELETE | `/api/employees/{id}` | delete |
| GET | `/api/analytics/summary` | KPI cards |
| GET | `/api/analytics/departments` | avg/total/headcount by department |
| GET | `/api/analytics/countries` | avg/total/headcount by country |
| GET | `/api/analytics/distribution` | salary histogram buckets |
| GET | `/api/analytics/top` | top/bottom N paid (`order=asc\|desc`) |
| POST | `/api/insights/query` | natural-language question |

Interactive docs: `http://localhost:8000/docs` (Swagger UI, auto-generated).

## 7. Currency Handling

Salaries are stored in local currency (INR, USD, GBP, EUR, SGD). Every aggregate
is normalized to USD via a static rate table (`app/services/fx.py`) because
summing mixed currencies is meaningless. Individual records always display in
their local currency; dashboards/analytics display USD and label it as such.
