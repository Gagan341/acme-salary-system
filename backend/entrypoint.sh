#!/usr/bin/env bash
set -e

# Wait for MySQL to accept connections (only relevant when DATABASE_URL is MySQL).
if echo "${DATABASE_URL}" | grep -q "mysql"; then
  echo "Waiting for MySQL to be ready..."
  python - <<'PY'
import os, time, sys
from sqlalchemy import create_engine, text
url = os.environ["DATABASE_URL"]
for attempt in range(60):
    try:
        create_engine(url).connect().execute(text("SELECT 1"))
        print("MySQL is ready.")
        sys.exit(0)
    except Exception as exc:
        print(f"  ...not ready ({attempt+1}/60): {exc}")
        time.sleep(2)
print("MySQL did not become ready in time.")
sys.exit(1)
PY
fi

# Apply migrations (create tables). create_all in app startup is a fallback.
echo "Running Alembic migrations..."
alembic upgrade head || echo "Alembic step skipped/failed; app will create_all on startup."

# Seed the database once (the script is idempotent: it skips if data exists).
echo "Seeding database (skips if already populated)..."
python seed.py --count "${SEED_COUNT:-10000}" || echo "Seeding step encountered an issue."

echo "Starting API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
