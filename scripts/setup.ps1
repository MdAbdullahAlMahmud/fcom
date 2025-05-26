# PowerShell setup script

Write-Host "Starting fCommerce setup..." -ForegroundColor Blue

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Blue
    @"
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=fcommerce

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding UTF8
    Write-Host ".env file created successfully!" -ForegroundColor Green
}

# Create database if it doesn't exist
Write-Host "Setting up database..." -ForegroundColor Blue
try {
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS fcommerce;"
    Write-Host "Database created successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error creating database. Please make sure MySQL is running and accessible." -ForegroundColor Red
    exit 1
}

# Run database initialization
Write-Host "Initializing database schema..." -ForegroundColor Blue
npm run db:init

Write-Host "Setup completed successfully!" -ForegroundColor Green 