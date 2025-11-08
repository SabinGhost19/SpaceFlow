#!/bin/bash

# 🚀 RoomBooking Backend Setup & Start Script
# This script handles complete backend initialization and startup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       🍺 RoomBooking Backend Setup & Start 🍺            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to print step headers
print_step() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

# Function to print warnings
print_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Step 1: Check if virtual environment exists
print_step "Step 1: Checking Virtual Environment"

if [ -d "venv" ]; then
    print_warning "Virtual environment 'venv' already exists"
    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing existing virtual environment..."
        rm -rf venv
        print_success "Removed old virtual environment"
    else
        print_info "Using existing virtual environment"
    fi
fi

if [ ! -d "venv" ]; then
    print_info "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -eq 0 ]; then
        print_success "Virtual environment created successfully"
    else
        print_error "Failed to create virtual environment"
        exit 1
    fi
else
    print_success "Virtual environment ready"
fi

# Step 2: Activate virtual environment
print_step "Step 2: Activating Virtual Environment"

source venv/bin/activate
if [ $? -eq 0 ]; then
    print_success "Virtual environment activated"
    print_info "Python location: $(which python)"
    print_info "Python version: $(python --version)"
else
    print_error "Failed to activate virtual environment"
    exit 1
fi

# Step 3: Install dependencies
print_step "Step 3: Installing Dependencies"

if [ ! -f "requirements.txt" ]; then
    print_error "requirements.txt not found!"
    exit 1
fi

print_info "Installing packages from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_success "All dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 4: Check database connection
print_step "Step 4: Verifying Database Connection"

print_info "Checking if PostgreSQL is running..."
if command -v pg_isready &> /dev/null; then
    pg_isready -h localhost
    if [ $? -eq 0 ]; then
        print_success "PostgreSQL is running"
    else
        print_warning "PostgreSQL might not be running"
        print_info "Make sure your database is accessible"
    fi
else
    print_warning "pg_isready not found, skipping PostgreSQL check"
fi

# Step 5: Run database migrations
print_step "Step 5: Running Database Migrations"

if [ -f "migrate.py" ]; then
    print_info "Creating/updating database tables..."
    python migrate.py
    if [ $? -eq 0 ]; then
        print_success "Database migrations completed"
    else
        print_error "Database migration failed"
        exit 1
    fi
else
    print_warning "migrate.py not found, skipping migrations"
fi

# Step 6: Populate rooms data
print_step "Step 6: Populating Rooms Data"

if [ -f "populate_rooms.py" ]; then
    print_info "Loading room data into database..."
    python populate_rooms.py
    if [ $? -eq 0 ]; then
        print_success "Rooms data populated successfully"
    else
        print_warning "Room population completed with warnings (this is normal if rooms already exist)"
    fi
else
    print_warning "populate_rooms.py not found, skipping room population"
fi

# Step 7: Update room images
print_step "Step 7: Updating Room Images"

if [ -f "update_room_images.py" ]; then
    print_info "Updating room images..."
    python update_room_images.py
    if [ $? -eq 0 ]; then
        print_success "Room images updated successfully"
    else
        print_warning "Room image update completed with warnings"
    fi
else
    print_warning "update_room_images.py not found, skipping image updates"
fi

# Step 8: Start the backend server
print_step "Step 8: Starting Backend Server"

print_info "Starting FastAPI server..."
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  🎉 Setup Complete! 🎉                    ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  Backend server is starting...                             ║${NC}"
echo -e "${GREEN}║  API Docs: http://localhost:8000/docs                      ║${NC}"
echo -e "${GREEN}║  Server: http://localhost:8000                             ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  Press Ctrl+C to stop the server                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Start the server
if [ -f "app/main.py" ]; then
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
else
    print_error "app/main.py not found!"
    exit 1
fi
