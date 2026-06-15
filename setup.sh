#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# One-command local setup WITHOUT Docker.
# Creates the Python venv + installs deps on first run, installs npm packages,
# seeds the database (SQLite by default — no MySQL needed), then starts BOTH
# the backend (port 8000) and the frontend (port 5173).
#
# Usage:   ./setup.sh
# Stop:    Ctrl+C  (stops both servers)
# ---------------------------------------------------------------------------
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Backend: setting up Python environment"
cd "$ROOT/backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

echo "==> Backend: seeding database (SQLite, skips if already seeded)"
python seed.py --count "${SEED_COUNT:-10000}"

echo "==> Backend: starting API on http://localhost:8000  (docs at /docs)"
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cleanup() {
  echo ""
  echo "==> Shutting down..."
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> Frontend: installing npm packages (first run only)"
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
  npm install --no-audit --no-fund
fi

echo "==> Frontend: starting on http://localhost:5173"
npm run dev
