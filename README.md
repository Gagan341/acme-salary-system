# ACME — Employee Salary Management System

A production-style full-stack app to manage salary records for ~10,000 employees:
employee CRUD, fast search, payroll dashboard, analytics charts, HR insight APIs,
and a natural-language (rule-based) query page.

**Stack:** React 19 · TypeScript · Vite · Material UI · TanStack Query · React
Router · Recharts — FastAPI · Python 3.12 · SQLAlchemy · Pydantic · Alembic —
MySQL 8 — Pytest · Vitest + React Testing Library.

> Status: backend tests **17/17 pass**, frontend tests **6/6 pass**, frontend
> **type-checks and production-builds**, seed + analytics + Alembic migration
> verified against a live database.

---

## Contents
- `docs/` — `requirements.md`, `architecture.md` (incl. ER diagram), `ai-usage.md`, `tradeoffs.md`
- `backend/` — FastAPI app (layered: routes → services → repositories), seed script, tests, Alembic
- `frontend/` — React + Vite SPA
- `docker-compose.yml` — MySQL + backend + frontend
- `setup.sh` / `setup.bat` — no-Docker bootstrap

---

## Option A — Run with Docker (recommended: truly "unzip and run")

Requires only **Docker Desktop** (or Docker Engine + Compose).

```bash
unzip acme-salary-system.zip
cd acme-salary-system
docker compose up --build
```

This starts MySQL, builds the backend (which waits for MySQL, applies the
migration, and seeds 10,000 employees automatically), and builds + serves the
frontend.

- Frontend: <http://localhost:3000>
- Backend API + Swagger docs: <http://localhost:8000/docs>
- MySQL: `localhost:3306` (db `acme_salary`, user `acme`, pass `acme_password`)

First build downloads images and seeds the DB, so give it a couple of minutes.
Seeding runs once; the data persists in a Docker volume. Stop with `Ctrl+C`;
remove everything (including data) with `docker compose down -v`.

> Tip: seed fewer rows for a faster first start with
> `SEED_COUNT=1000 docker compose up --build`.

---

## Option B — Run without Docker (auto venv + npm, SQLite)

Requires **Python 3.12** and **Node.js 20+**. No manual `pip install` — the
script creates the virtualenv and installs everything on first run, then seeds a
local SQLite database (no MySQL needed) and starts both servers.

macOS / Linux:
```bash
cd acme-salary-system
./setup.sh
```

Windows:
```bat
cd acme-salary-system
setup.bat
```

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:8000/docs>

To use MySQL instead of SQLite here, set `DATABASE_URL` before running, e.g.
`export DATABASE_URL="mysql+pymysql://acme:acme_password@localhost:3306/acme_salary"`.

---

## Manual backend commands

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

alembic upgrade head          # create schema (optional; app also create_all on start)
python seed.py --count 10000  # seed data (idempotent; skips if already seeded)
uvicorn app.main:app --reload # run API on :8000
pytest                        # run backend tests (17)
```

## Manual frontend commands

```bash
cd frontend
npm install
npm run dev      # dev server on :5173 (expects API at http://localhost:8000/api)
npm run build    # type-check + production build
npm run test     # run frontend tests (6)
```

Set the API base URL via `frontend/.env` → `VITE_API_URL=http://localhost:8000/api`.

---

## API Documentation

Full interactive docs are auto-generated at `http://localhost:8000/docs`.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/employees` | `page, page_size, search, country, department, status, sort_by, sort_dir` |
| GET | `/api/employees/filters` | dropdown values |
| GET | `/api/employees/{id}` | one employee |
| POST | `/api/employees` | create |
| PUT | `/api/employees/{id}` | update |
| DELETE | `/api/employees/{id}` | delete |
| GET | `/api/analytics/summary` | totals, average, median, high, low (USD) |
| GET | `/api/analytics/departments` | by department |
| GET | `/api/analytics/countries` | by country |
| GET | `/api/analytics/distribution` | salary histogram |
| GET | `/api/analytics/top` | `limit`, `order=asc\|desc` (top/bottom paid) |
| POST | `/api/insights/query` | `{ "question": "..." }` natural-language query |

Example:
```bash
curl -X POST http://localhost:8000/api/insights/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the total payroll cost in India?"}'
```

---

## Testing

```bash
cd backend  && pytest          # CRUD, analytics math, NL query parser
cd frontend && npm run test     # StatCard, Dashboard cards, Employees table, AI Insights
```

---

## Currency note

Salaries are stored in each employee's **local** currency. All dashboard and
analytics figures are **normalized to USD** via a static FX table
(`backend/app/services/fx.py`) so cross-country totals are meaningful. Individual
records always display in their local currency. See `docs/tradeoffs.md`.

---

## Deployment notes

- **Backend → Render/Railway:** deploy `backend/` (Docker or `pip install -r
  requirements.txt` + `uvicorn app.main:app`). Set `DATABASE_URL` to the managed
  MySQL connection string and `CORS_ORIGINS` to your frontend URL. Run
  `alembic upgrade head` and `python seed.py` once.
- **Frontend → Vercel:** project root `frontend/`, build `npm run build`, output
  `dist`. Set `VITE_API_URL` to the deployed backend's `/api` URL.

## Git commit plan
1. Initial project setup · 2. Database design · 3. Employee CRUD ·
4. Analytics APIs · 5. Dashboard UI · 6. Employee Management UI · 7. AI Insights ·
8. Testing · 9. Documentation · 10. Deployment.

## Screenshots
_Add screenshots of Dashboard, Employees, Analytics, and AI Insights here._
```
docs/screenshots/dashboard.png
docs/screenshots/employees.png
docs/screenshots/analytics.png
docs/screenshots/ai-insights.png
```
