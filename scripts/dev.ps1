# PowerShell script for development

Write-Host "Starting fCommerce in development mode..." -ForegroundColor Blue

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host ".env file not found. Running setup first..." -ForegroundColor Red
    & .\scripts\setup.ps1
}

# Check if database exists
try {
    $env:Path += ";C:\Program Files\MySQL\MySQL Server 8.0\bin"
    mysql -u root -e "USE fcommerce" | Out-Null
} catch {
    Write-Host "Database not found. Running setup first..." -ForegroundColor Red
    & .\scripts\setup.ps1
}

# Start development server and Tailwind CSS watcher concurrently
Write-Host "Starting development server and Tailwind CSS watcher..." -ForegroundColor Blue

# Start both processes in the background
$devServer = Start-Process powershell -ArgumentList "npm run dev" -NoNewWindow -PassThru
$tailwindWatcher = Start-Process powershell -ArgumentList "npx tailwindcss -i ./app/globals.css -o ./app/tailwind-build.css --watch" -NoNewWindow -PassThru

# Wait for both processes
$devServer.WaitForExit()
$tailwindWatcher.WaitForExit() 