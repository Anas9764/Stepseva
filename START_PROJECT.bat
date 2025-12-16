@echo off
echo ========================================
echo   StepSeva Project Startup Script
echo ========================================
echo.

echo [1/4] Checking Redis...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Redis is not running!
    echo Please start Redis first:
    echo   redis-server
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Redis is running
)
echo.

echo [2/4] Checking MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB service might already be running or not installed as service
    echo Please ensure MongoDB is running on port 27017
) else (
    echo [OK] MongoDB service started
)
echo.

echo [3/4] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
echo [OK] Backend server starting...
echo.

echo [4/4] Starting Frontend and Admin Panel...
start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 2 /nobreak >nul
start "Admin Panel" cmd /k "cd admin-panel && npm run dev"
echo [OK] Frontend and Admin Panel starting...
echo.

echo ========================================
echo   All services are starting!
echo ========================================
echo.
echo Frontend:    http://localhost:5173
echo Admin Panel: http://localhost:5174
echo Backend API: http://localhost:5000/api
echo.
echo Press any key to exit...
pause >nul

