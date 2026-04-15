# ============================================================
# build.ps1 — Скрипт для сборки продакшен версии
# ============================================================

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "Building production version..." "Yellow"

# Сборка frontend
Write-ColorOutput "Building frontend..." "Yellow"
Set-Location mini-app
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "Frontend build successful!" "Green"
} else {
    Write-ColorOutput "Frontend build failed!" "Red"
    exit 1
}
Set-Location ..

# Проверка backend
Write-ColorOutput "Checking backend..." "Yellow"
py -3.12 -m pip install -r requirements.txt
Write-ColorOutput "Backend dependencies installed" "Green"

Write-ColorOutput ""
Write-ColorOutput "========================================" "Green"
Write-ColorOutput "Build complete!" "Green"
Write-ColorOutput "========================================" "Green"
Write-ColorOutput "Frontend build: mini-app/dist/" "Green"
Write-ColorOutput "Next steps:" "Yellow"
Write-ColorOutput "1. Upload mini-app/dist to Vercel/Netlify" "Yellow"
Write-ColorOutput "2. Deploy backend to Render/Railway" "Yellow"
Write-ColorOutput "3. Update URLs in .env and keyboards/inline.py" "Yellow"
Write-ColorOutput "========================================" "Green"
