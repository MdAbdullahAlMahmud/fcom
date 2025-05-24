#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Setting up fCommerce project...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL is not installed. Please install MySQL first.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cat > .env << EOL
DATABASE_URL="mysql://root:@localhost:3306/fcommerce"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
EOL
fi

# Create database if it doesn't exist
echo -e "${BLUE}Creating database...${NC}"
mysql -u root -e "CREATE DATABASE IF NOT EXISTS fcommerce;"

# Initialize database
echo -e "${BLUE}Initializing database...${NC}"
npm run db:init

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${BLUE}You can now run the following commands:${NC}"
echo -e "  ${GREEN}npm run dev${NC}     - Start development server"
echo -e "  ${GREEN}npm run build${NC}   - Build for production"
echo -e "  ${GREEN}npm run start${NC}   - Start production server" 