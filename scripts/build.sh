#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Building fCommerce for production...${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}.env file not found. Running setup first...${NC}"
    ./scripts/setup.sh
fi

# Run linting
echo -e "${BLUE}Running linting...${NC}"
npm run lint

# Build the application
echo -e "${BLUE}Building application...${NC}"
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Build completed successfully!${NC}"
    echo -e "${BLUE}You can now run:${NC}"
    echo -e "  ${GREEN}npm run start${NC}   - Start production server"
else
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi 