@echo off
echo =====================================================
echo  CyberGuard AI - Backend Startup
echo =====================================================

cd /d "%~dp0"

if not exist "backend\venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    cd backend
    python -m venv venv
    cd ..
)

echo Activating virtual environment...
call backend\venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r backend\requirements.txt --quiet

if not exist "backend\.env" (
    echo Copying .env.example to .env...
    copy backend\.env.example backend\.env
    echo IMPORTANT: Edit backend\.env with your PostgreSQL password!
    pause
)

echo.
echo Starting FastAPI backend on http://localhost:8000
echo API docs available at http://localhost:8000/docs
echo.
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
