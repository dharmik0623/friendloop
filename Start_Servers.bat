@echo off
echo =========================================
echo   FriendLoop Automated Startup Script
echo =========================================
echo.

echo [1/3] Starting Database Containers via Docker...
docker-compose up -d

echo.
echo [2/3] Starting Node.js Backend Server...
start "FriendLoop Backend API" cmd /k "cd server && npm run dev"

echo.
echo [3/3] Starting Next.js Frontend App...
start "FriendLoop Frontend UI" cmd /k "cd client && npm run dev"

echo.
echo Servers are booting up in separate background windows!
echo Once the startup text settles down, you can open the app.
echo.
pause
