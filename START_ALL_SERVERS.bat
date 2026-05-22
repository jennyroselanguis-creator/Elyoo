@echo off
REM Elyoo Mobile Devices - Complete Startup Script

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Elyoo Mobile Devices - System Startup                    ║
echo ║  Starting MySQL, Backend, and Frontend Servers            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Start MySQL
echo [1/3] Starting MySQL Database Server...
start "MySQL Server" "C:\xampp\mysql\bin\mysqld.exe" --datadir="C:\xampp\mysql\data" --port=3306

REM Wait for MySQL to initialize
timeout /t 8 /nobreak
echo [2/3] MySQL initialized. Starting Backend API Server...

REM Start Backend in new window
cd /d "C:\xampp2.0\htdocs\webPro\backend"
start "Backend API Server" cmd /k "npm start"

REM Wait for backend to start
timeout /t 3 /nobreak
echo [3/3] Starting Frontend React Server...

REM Start Frontend in new window
cd /d "C:\xampp2.0\htdocs\webPro"
start "Frontend React Server" cmd /k "npm start"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✅ All servers are starting!                             ║
echo ║                                                            ║
echo ║  Frontend:  http://localhost:3000                         ║
echo ║  Backend:   http://localhost:3001/api                    ║
echo ║  Database:  localhost:3306 (root / no password)           ║
echo ║                                                            ║
echo ║  Admin Login:                                              ║
echo ║  Email:     admin@elyoo.com                               ║
echo ║  Password:  admin123                                      ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

pause
