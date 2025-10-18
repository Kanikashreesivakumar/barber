# Quick Start Script for Backend
# Double-click start.bat OR run this in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting Barber Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "server.js")) {
    Write-Host "ERROR: server.js not found!" -ForegroundColor Red
    Write-Host "Please run this from the backend directory" -ForegroundColor Yellow
    pause
    exit 1
}

# Create .env if missing
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    @"
MONGO_URI=mongodb://127.0.0.1:27017/barberdb
PORT=5000
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ".env file created!" -ForegroundColor Green
    Write-Host ""
}

# Install dependencies if missing
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "Starting server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will run on: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To seed the database, open another terminal and run:" -ForegroundColor Yellow
Write-Host "  cd d:\barber\backend" -ForegroundColor Gray
Write-Host "  node setup.js" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

node server.js
