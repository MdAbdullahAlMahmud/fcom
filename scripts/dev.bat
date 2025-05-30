@echo off
echo Starting fCommerce in development mode...

REM Check if .env exists
if not exist .env (
    echo .env file not found. Running setup first...
    call scripts\setup.bat
)

REM Start development server
echo Starting development server...
start cmd /k "npm run dev"

REM Rebuild Tailwind CSS in watch mode
echo Starting Tailwind CSS in watch mode...
start cmd /k "npx tailwindcss -i ./app/globals.css -o ./app/tailwind-build.css --watch"
