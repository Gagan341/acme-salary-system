@echo off
REM ---------------------------------------------------------------------------
REM One-command local setup WITHOUT Docker (Windows).
REM Creates the venv + installs deps on first run, installs npm packages, seeds
REM the SQLite database, then starts backend (8000) and frontend (5173) in two
REM separate windows.
REM
REM Usage:  setup.bat
REM ---------------------------------------------------------------------------
setlocal
set ROOT=%~dp0

echo ==^> Backend: setting up Python environment
cd /d "%ROOT%backend"
if not exist ".venv" (
    python -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

echo ==^> Backend: seeding database (SQLite, skips if already seeded)
python seed.py --count 10000

echo ==^> Backend: starting API in a new window (http://localhost:8000)
start "ACME Backend" cmd /k "cd /d %ROOT%backend && call .venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo ==^> Frontend: installing npm packages (first run only)
cd /d "%ROOT%frontend"
if not exist "node_modules" (
    call npm install --no-audit --no-fund
)

echo ==^> Frontend: starting on http://localhost:5173
start "ACME Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"

echo.
echo Both servers are starting in separate windows.
echo Backend:  http://localhost:8000/docs
echo Frontend: http://localhost:5173
endlocal
