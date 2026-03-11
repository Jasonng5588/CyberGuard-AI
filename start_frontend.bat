@echo off
echo =====================================================
echo  CyberGuard AI - Frontend Startup
echo =====================================================

cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing Node dependencies...
    npm install
)

echo.
echo Starting Next.js frontend on http://localhost:3000
echo.
npm run dev
