@echo off
echo Starting FriendLoop Application...

echo.
echo [1/5] Checking environment variables...
if not exist ".env" (
    echo Creating .env from .env.example
    copy .env.example .env
) else (
    echo .env file already exists.
)

echo.
echo [2/5] Starting databases via Docker (PostgreSQL, MongoDB, Redis)...
docker-compose up -d

echo.
echo [3/5] Starting Backend Server...
start "FriendLoop Server" cmd /c "cd server && npm install && npm run dev"

echo.
echo [4/5] Starting Frontend Client...
start "FriendLoop Client" cmd /c "cd client && npm install && npm run dev"

echo.
echo [5/5] Waiting for services to initialize...
timeout /t 10 /nobreak > NUL

echo.
echo Opening browser to http://localhost:3000...
start http://localhost:3000

echo.
echo ✅ FriendLoop has been successfully launched!
echo Server is running on port 5000.
echo Client is running on port 3000.
pause
