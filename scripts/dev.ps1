# PowerShell script for development

Write-Host "Starting fCommerce in development mode..." -ForegroundColor Blue

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host ".env file not found. Running setup first..." -ForegroundColor Red
    & .\scripts\setup.ps1
}

# Check if database exists
try {
    mysql -u root -e "USE fcommerce" | Out-Null
} catch {
    Write-Host "Database not found. Running setup first..." -ForegroundColor Red
    & .\scripts\setup.ps1
}

# Start development server
Write-Host "Starting development server..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "npm run dev"

# Rebuild Tailwind CSS in watch mode
Write-Host "Starting Tailwind CSS in watch mode..." -ForegroundColor Blue
npx tailwindcss -i ./app/globals.css -o ./app/tailwind-build.css --watch 