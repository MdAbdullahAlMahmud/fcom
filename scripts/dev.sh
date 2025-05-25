#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Starting fCommerce in development mode...${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}.env file not found. Running setup first...${NC}"
    ./scripts/setup.sh
fi

# Check if database exists
if ! mysql -u root -e "USE fcommerce" &> /dev/null; then
    echo -e "${RED}Database not found. Running setup first...${NC}"
    ./scripts/setup.sh
fi

# Start development server
echo -e "${BLUE}Starting development server...${NC}"
npm run dev &

# Rebuild Tailwind CSS in watch mode
echo -e "${BLUE}Starting Tailwind CSS in watch mode...${NC}"
npx tailwindcss -i ./app/globals.css -o ./app/tailwind-build.css --watch