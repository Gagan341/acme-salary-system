# Tradeoffs & Key Decisions

Each decision lists the choice, the alternative, and why.

### 1. Salaries in local currency, analytics in USD
**Choice:** store `salary` + `currency` per employee; convert to USD for every
aggregate using a static rate table (`services/fx.py`).
**Alternative:** store a USD column too, or normalize on write.
**Why:** the brief requires local-currency storage, but summing mixed currencies
is meaningless. Converting at read time keeps source data faithful and makes the
rate table the single source of truth. A stored USD column would drift whenever
rates change.
**Cost:** aggregates depend on a static table; real systems would use a daily FX
feed. Documented and isolated to one module so it's swappable.

### 2. Single `employees` table, enums as constants
**Choice:** one normalized table; departments/countries/currencies as fixed
application-level enumerations.
**Alternative:** separate `departments`, `countries`, `currencies` lookup tables
with foreign keys (textbook 3NF).
**Why:** these sets are small, stable, and non-relational here. Extra join tables
would add query/maintenance overhead with no integrity benefit at this scale.
**Cost:** adding a department means a code change. Acceptable; if these became
user-managed, promoting them to tables is a contained migration.

### 3. Analytics computed in Python, not pure SQL
**Choice:** load rows once and reduce in Python for USD-weighted aggregates.
**Alternative:** SQL `GROUP BY` with a `CASE` FX conversion.
**Why:** the FX multiplier per currency is cleaner and more testable in Python,
and correctness across currencies is obvious. At 10k rows this is fast.
**Cost:** O(n) per analytics call and re-fetching on each request. For larger
datasets the next step is a cached summary or a SQL aggregate with CASE-based FX
(noted in architecture.md). TanStack Query already caches results client-side.

### 4. Repository + Service layering
**Choice:** strict Route → Service → Repository separation.
**Alternative:** "fat" route handlers querying the ORM directly (faster to write).
**Why:** isolates business rules for unit testing, keeps SQL in one place, and
makes the codebase legible to reviewers. Directly enables the 80% coverage goal.
**Cost:** more files/indirection — justified for a production-intended system.

### 5. Rule-based NL interpreter (no LLM)
**Choice:** keyword + entity pattern matching → SQL.
**Alternative:** call an LLM to translate text to SQL.
**Why:** deterministic, auditable, free, and no salary data leaves the system —
critical for compensation. The question space is small and well-defined.
**Cost:** only handles known patterns; returns a helpful fallback otherwise. The
`InsightsService` seam allows swapping in an LLM later without API/UI changes.

### 6. SQLite for tests & local quick-start, MySQL for prod
**Choice:** `DATABASE_URL` selects the engine. Tests use in-memory SQLite;
`setup.sh` defaults to a SQLite file; docker-compose injects MySQL.
**Alternative:** require MySQL everywhere.
**Why:** tests run in ~1.5s with zero external services, and the app is runnable
the instant it's unzipped. MySQL is used for the real deployment via Docker.
**Cost:** a small dialect surface differs between SQLite and MySQL; the ORM
abstracts it and the same models/migrations target both.

### 7. Docker Compose as the portable "unzip and run", not a bundled venv
**Choice:** ship Dockerfiles + compose; provide `setup.sh`/`setup.bat` for the
no-Docker path that auto-creates the venv and installs deps on first run.
**Alternative:** bundle a pre-built virtualenv (and node_modules) in the zip.
**Why:** virtualenvs and `node_modules` contain absolute paths and OS/CPU-specific
binaries; they do not move reliably between machines or operating systems.
Docker produces a genuinely reproducible environment; the setup scripts give a
one-command fallback. Bundling binaries would bloat the zip and break on a
different OS.
**Cost:** first run installs dependencies (Docker build or script). One-time.

### 8. `create_all` on startup *and* Alembic migrations
**Choice:** the app calls `create_all` at startup; Alembic migration also exists.
**Why:** guarantees the unzip-and-run path works even before migrations are run,
while Alembic remains the real migration tool for schema evolution. `create_all`
is a no-op when the schema already exists.
**Cost:** mild redundancy; harmless and pragmatic.
