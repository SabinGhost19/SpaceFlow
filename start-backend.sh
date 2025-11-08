#!/bin/bash

################################################################################
# 🚀 Start Room Booking Backend Server
################################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Starting Room Booking Backend Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo -e "${YELLOW}⚠ Please run this script from the project root directory${NC}"
    exit 1
fi

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠ Virtual environment not found. Please run setup-backend.sh first${NC}"
    exit 1
fi

# Activate virtual environment
echo -e "${BLUE}📦 Activating virtual environment...${NC}"
source venv/bin/activate

# Check if PostgreSQL is running
echo -e "${BLUE}🔍 Checking PostgreSQL...${NC}"
if ! docker ps | grep -q roombooking_postgres; then
    echo -e "${YELLOW}⚠ PostgreSQL is not running. Starting it now...${NC}"
    cd ..
    docker-compose up -d postgres
    echo -e "${GREEN}✓ PostgreSQL started${NC}"
    sleep 5
    cd backend
else
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
fi

# Start the backend server
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Backend server is starting...${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}📍 API Documentation: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "${BLUE}📍 Alternative Docs: ${GREEN}http://localhost:8000/redoc${NC}"
echo -e "${BLUE}📍 API Base URL: ${GREEN}http://localhost:8000${NC}\n"

echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}\n"

# Start uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
