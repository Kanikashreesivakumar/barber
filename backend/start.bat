@echo off
echo ========================================
echo  Starting Barber Backend Server
echo ========================================
echo.

cd /d "%~dp0"

REM Check if .env exists
if not exist .env (
    echo Creating .env file...
    (
        echo MONGO_URI=mongodb://127.0.0.1:27017/barberdb
        echo PORT=5000
        echo NODE_ENV=development
    ) > .env
    echo .env file created!
    echo.
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo.
echo Server will run on: http://localhost:5000
echo.
echo To seed the database, open another terminal and run:
echo   cd d:\barber\backend
echo   node setup.js
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js
