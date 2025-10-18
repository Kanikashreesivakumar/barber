# PowerShell Script to Start Barber Backend
# Run this with: .\start-backend.ps1

Write-Host "🚀 Starting Barber Backend Server" -ForegroundColor Green
Write-Host ""

# Check if we're in the backend directory
if (-not (Test-Path "server.js")) {
    Write-Host "❌ Error: server.js not found!" -ForegroundColor Red
    Write-Host "Please run this script from the backend directory" -ForegroundColor Yellow
    Write-Host "Example: cd d:\barber\backend; .\start-backend.ps1" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating default .env..." -ForegroundColor Yellow
    @"
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/barbershop

# Server Port
PORT=5000

# Environment
NODE_ENV=development
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
}

# Start the server
Write-Host "🚀 Starting server..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

node start.js
