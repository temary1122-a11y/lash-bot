# ============================================================
# start.ps1 — Script to start lash_bot with Mini App
# ============================================================

$ErrorActionPreference = "Stop"

# Function for colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Stop existing processes
Write-ColorOutput "Stopping existing processes..." "Yellow"
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-ColorOutput "Processes stopped" "Green"

# Check Python 3.12
Write-ColorOutput "Checking Python 3.12..." "Yellow"
try {
    $pythonVersion = py -3.12 --version 2>&1
    if ($pythonVersion -match "Python 3\.12") {
        Write-ColorOutput "Python 3.12 found: $pythonVersion" "Green"
    } else {
        Write-ColorOutput "Python 3.12 not found" "Red"
        exit 1
    }
} catch {
    Write-ColorOutput "Error checking Python: $_" "Red"
    exit 1
}

# Check Node.js
Write-ColorOutput "Checking Node.js..." "Yellow"
try {
    $nodeVersion = node --version 2>&1
    Write-ColorOutput "Node.js found: $nodeVersion" "Green"
} catch {
    Write-ColorOutput "Node.js not found" "Red"
    exit 1
}

# Install Python dependencies
Write-ColorOutput "Installing Python dependencies..." "Yellow"
try {
    py -3.12 -m pip install -r requirements.txt
    Write-ColorOutput "Python dependencies installed" "Green"
} catch {
    Write-ColorOutput "Error installing Python dependencies: $_" "Red"
}

# Install Node.js dependencies
Write-ColorOutput "Installing Node.js dependencies..." "Yellow"
try {
    Set-Location mini-app
    npm install
    Set-Location ..
    Write-ColorOutput "Node.js dependencies installed" "Green"
} catch {
    Write-ColorOutput "Error installing Node.js dependencies: $_" "Red"
}

# Start servers
Write-ColorOutput "Starting servers..." "Yellow"

$processes = @()

# Backend API
Write-ColorOutput "Starting Backend API (port 8000)..." "Yellow"
$backendProcess = Start-Process -FilePath "py" -ArgumentList "-3.12", "-m", "uvicorn", "api.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload" -PassThru -NoNewWindow
$processes += $backendProcess
Write-ColorOutput "Backend API started (PID: $($backendProcess.Id))" "Green"

# Frontend
Write-ColorOutput "Starting Frontend (port 3000)..." "Yellow"
$frontendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm", "run", "dev" -WorkingDirectory "mini-app" -PassThru -NoNewWindow
$processes += $frontendProcess
Write-ColorOutput "Frontend started (PID: $($frontendProcess.Id))" "Green"

# Telegram Bot
Write-ColorOutput "Starting Telegram Bot..." "Yellow"
$botProcess = Start-Process -FilePath "py" -ArgumentList "-3.12", "bot.py" -PassThru -NoNewWindow
$processes += $botProcess
Write-ColorOutput "Telegram Bot started (PID: $($botProcess.Id))" "Green"

Start-Sleep -Seconds 3

Write-ColorOutput ""
Write-ColorOutput "========================================" "Green"
Write-ColorOutput "All services started!" "Green"
Write-ColorOutput "========================================" "Green"
Write-ColorOutput "Backend: http://localhost:8000" "Green"
Write-ColorOutput "Frontend: http://localhost:3000" "Green"
Write-ColorOutput "API Docs: http://localhost:8000/docs" "Green"
Write-ColorOutput "Bot: Running in Telegram" "Green"
Write-ColorOutput "========================================" "Green"
Write-ColorOutput ""
Write-ColorOutput "For Mini App use http://localhost:3000" "Yellow"
Write-ColorOutput "For HTTPS in production deploy frontend to hosting" "Yellow"
Write-ColorOutput ""
Write-ColorOutput "Press Ctrl+C to stop all services" "Yellow"

# Handle Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-ColorOutput ""
    Write-ColorOutput "Stopping all processes..." "Yellow"
    foreach ($process in $processes) {
        if (-not $process.HasExited) {
            Stop-Process -Id $process.Id -Force
        }
    }
    Write-ColorOutput "All processes stopped" "Green"
}
