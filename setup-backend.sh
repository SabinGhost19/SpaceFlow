#!/bin/bash

################################################################################
# 🚀 Room Booking Backend - Complete Setup Script
# This script automates the entire backend setup process
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

################################################################################
# Pre-flight Checks
################################################################################

print_header "🔍 Pre-flight Checks"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first:"
    echo "  Visit: https://docs.docker.com/get-docker/"
    exit 1
fi
print_success "Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose:"
    echo "  Visit: https://docs.docker.com/compose/install/"
    exit 1
fi
print_success "Docker Compose is installed"

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.8 or higher:"
    echo "  Visit: https://www.python.org/downloads/"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
print_success "Python is installed: $PYTHON_VERSION"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip3"
    exit 1
fi
print_success "pip3 is installed"

################################################################################
# Step 1: Setup Environment Variables
################################################################################

print_header "📝 Step 1: Setting up Environment Variables"

cd backend

if [ -f ".env" ]; then
    print_warning ".env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

cat > .env << 'EOF'
# Database Configuration (for local scripts)
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=roombooking
DB_PORT=5432

# Security
SECRET_KEY=your-secret-key-here-change-in-production-$(date +%s)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
EOF

print_success "Created .env file in backend/"

cd ..

################################################################################
# Step 2: Start PostgreSQL with Docker
################################################################################

print_header "🐳 Step 2: Starting PostgreSQL Container"

# Check if container is already running
if docker ps | grep -q roombooking_postgres; then
    print_warning "PostgreSQL container is already running"
else
    print_info "Starting PostgreSQL container..."
    docker-compose up -d postgres
    
    print_info "Waiting for PostgreSQL to be ready (30 seconds)..."
    for i in {1..30}; do
        echo -n "."
        sleep 1
    done
    echo ""
fi

# Verify PostgreSQL is running
if docker ps | grep -q roombooking_postgres; then
    print_success "PostgreSQL container is running"
else
    print_error "Failed to start PostgreSQL container"
    exit 1
fi

# Test connection
print_info "Testing PostgreSQL connection..."
sleep 5
if docker exec roombooking_postgres psql -U postgres -d roombooking -c "SELECT 1;" &> /dev/null; then
    print_success "PostgreSQL connection successful"
else
    print_error "Cannot connect to PostgreSQL"
    print_info "Trying to create database..."
    docker exec roombooking_postgres psql -U postgres -c "CREATE DATABASE roombooking;" 2>/dev/null || true
    sleep 2
    if docker exec roombooking_postgres psql -U postgres -d roombooking -c "SELECT 1;" &> /dev/null; then
        print_success "Database created and connection successful"
    else
        print_error "Still cannot connect to PostgreSQL. Check Docker logs:"
        echo "  docker logs roombooking_postgres"
        exit 1
    fi
fi

################################################################################
# Step 3: Setup Python Virtual Environment
################################################################################

print_header "🐍 Step 3: Setting up Python Virtual Environment"

cd backend

if [ -d "venv" ]; then
    print_warning "Virtual environment already exists. Skipping creation."
else
    print_info "Creating virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

print_info "Activating virtual environment..."
source venv/bin/activate

print_info "Installing Python dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt

print_success "Python dependencies installed"

################################################################################
# Step 4: Run Database Migration
################################################################################

print_header "🗄️ Step 4: Running Database Migration"

print_info "Creating database tables..."
python migrate.py

if [ $? -eq 0 ]; then
    print_success "Database tables created successfully"
else
    print_error "Failed to create database tables"
    exit 1
fi

################################################################################
# Step 5: Populate Database with Rooms
################################################################################

print_header "🏢 Step 5: Populating Database with Rooms"

# Check if rooms_data.json exists
if [ ! -f "rooms_data.json" ]; then
    print_warning "rooms_data.json not found. Extracting from SVG..."
    if [ -f "../OBJECTS.svg" ]; then
        print_info "Running SVG extraction script..."
        python extract_rooms_from_svg.py
        if [ $? -eq 0 ]; then
            print_success "Rooms data extracted from SVG"
        else
            print_error "Failed to extract rooms from SVG"
            exit 1
        fi
    else
        print_error "OBJECTS.svg not found in project root"
        exit 1
    fi
fi

print_info "Populating database with rooms..."
python populate_rooms.py

if [ $? -eq 0 ]; then
    print_success "Database populated with rooms"
else
    print_error "Failed to populate database"
    exit 1
fi

################################################################################
# Step 6: Verify Database
################################################################################

print_header "✅ Step 6: Verifying Database"

print_info "Checking database contents..."

# Count rooms
ROOM_COUNT=$(docker exec roombooking_postgres psql -U postgres -d roombooking -t -c "SELECT COUNT(*) FROM rooms;" 2>/dev/null | xargs)

if [ -n "$ROOM_COUNT" ] && [ "$ROOM_COUNT" -gt 0 ]; then
    print_success "Database verification successful: $ROOM_COUNT rooms found"
else
    print_error "Database verification failed: No rooms found"
    exit 1
fi

################################################################################
# Summary & Next Steps
################################################################################

print_header "🎉 Setup Complete!"

echo -e "${GREEN}Your Room Booking Backend is ready!${NC}\n"

echo -e "${BLUE}📊 Database Statistics:${NC}"
echo -e "  • Total Rooms: ${GREEN}$ROOM_COUNT${NC}"
echo -e "  • Database: ${GREEN}roombooking${NC}"
echo -e "  • PostgreSQL Port: ${GREEN}5432${NC}"

echo -e "\n${BLUE}🚀 Next Steps:${NC}"
echo -e "\n1. Start the backend server:"
echo -e "   ${YELLOW}cd backend${NC}"
echo -e "   ${YELLOW}source venv/bin/activate${NC}"
echo -e "   ${YELLOW}uvicorn app.main:app --reload --host 0.0.0.0 --port 8000${NC}"

echo -e "\n2. Access API documentation:"
echo -e "   ${YELLOW}http://localhost:8000/docs${NC}"

echo -e "\n3. Test API endpoints:"
echo -e "   ${YELLOW}curl http://localhost:8000/api/v1/rooms?limit=5${NC}"

echo -e "\n4. View PostgreSQL data:"
echo -e "   ${YELLOW}docker exec -it roombooking_postgres psql -U postgres -d roombooking${NC}"

echo -e "\n${BLUE}📖 Useful Commands:${NC}"
echo -e "  • View logs: ${YELLOW}docker logs roombooking_postgres${NC}"
echo -e "  • Stop database: ${YELLOW}docker-compose stop postgres${NC}"
echo -e "  • Restart database: ${YELLOW}docker-compose restart postgres${NC}"
echo -e "  • Remove all: ${YELLOW}docker-compose down -v${NC}"

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Setup completed successfully! Happy coding! 🎊${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
