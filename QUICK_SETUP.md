# 🚀 Quick Start - Backend Setup

This guide will help you set up the Room Booking backend in minutes using automated setup scripts.

## 📋 Prerequisites

Before running the setup scripts, make sure you have:

- ✅ **Docker** & **Docker Compose** installed ([Get Docker](https://docs.docker.com/get-docker/))
- ✅ **Python 3.8+** installed ([Get Python](https://www.python.org/downloads/))
- ✅ **Git** installed (to clone the repository)

## 🎯 One-Command Setup

Choose the script for your operating system:

### For Linux / macOS

```bash
# Make the script executable
chmod +x setup-backend.sh

# Run the setup script
./setup-backend.sh
```

### For Windows (PowerShell)

```powershell
# Run PowerShell as Administrator (recommended)

# Set execution policy (if needed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the setup script
.\setup-backend.ps1
```

## 🔧 What Does the Setup Script Do?

The automated setup script performs the following steps:

1. ✅ **Pre-flight checks** - Verifies Docker, Python, and pip are installed
2. ✅ **Environment setup** - Creates `.env` file with database credentials
3. ✅ **Start PostgreSQL** - Launches PostgreSQL container via Docker
4. ✅ **Python environment** - Creates virtual environment and installs dependencies
5. ✅ **Database migration** - Creates all database tables
6. ✅ **Data extraction** - Extracts room data from SVG file (if needed)
7. ✅ **Database population** - Inserts 134 rooms into the database
8. ✅ **Verification** - Confirms everything is working correctly

**Total setup time: ~2-3 minutes** ⏱️

## 📊 Expected Output

You should see output like this:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Pre-flight Checks
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Docker is installed
✓ Docker Compose is installed
✓ Python is installed: Python 3.11.0
✓ pip3 is installed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Step 1: Setting up Environment Variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Created .env file in backend/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐳 Step 2: Starting PostgreSQL Container
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ PostgreSQL container is running
✓ PostgreSQL connection successful

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐍 Step 3: Setting up Python Virtual Environment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Virtual environment created
✓ Python dependencies installed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗄️ Step 4: Running Database Migration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Database tables created successfully

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 Step 5: Populating Database with Rooms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Database populated with rooms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Step 6: Verifying Database
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Database verification successful: 134 rooms found

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your Room Booking Backend is ready!

📊 Database Statistics:
  • Total Rooms: 134
  • Database: roombooking
  • PostgreSQL Port: 5432

🚀 Next Steps:

1. Start the backend server:
   cd backend
   source venv/bin/activate          # Linux/Mac
   .\venv\Scripts\Activate.ps1       # Windows
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

2. Access API documentation:
   http://localhost:8000/docs

3. Test API endpoints:
   curl http://localhost:8000/api/v1/rooms?limit=5
```

## 🎯 After Setup

Once the setup is complete, start the backend server:

### Linux / macOS

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Windows (PowerShell)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- **API Base URL:** `http://localhost:8000`
- **API Documentation:** `http://localhost:8000/docs`
- **Alternative Docs:** `http://localhost:8000/redoc`

## 🧪 Testing the Setup

### 1. Check API Health

```bash
curl http://localhost:8000/health
```

### 2. Get All Rooms

```bash
curl http://localhost:8000/api/v1/rooms?limit=5
```

### 3. Get Rooms Count

```bash
curl http://localhost:8000/api/v1/rooms/count
```

### 4. Access Database Directly

```bash
docker exec -it roombooking_postgres psql -U postgres -d roombooking
```

Then run SQL queries:

```sql
-- View all tables
\dt

-- Count rooms
SELECT COUNT(*) FROM rooms;

-- View first 5 rooms
SELECT id, name, capacity, price FROM rooms LIMIT 5;

-- Exit psql
\q
```

## 🔧 Useful Commands

### Docker Management

```bash
# View container logs
docker logs roombooking_postgres

# Stop PostgreSQL
docker-compose stop postgres

# Start PostgreSQL
docker-compose start postgres

# Restart PostgreSQL
docker-compose restart postgres

# Remove containers and volumes (⚠️ deletes all data)
docker-compose down -v
```

### Python Environment

```bash
# Activate virtual environment
source venv/bin/activate           # Linux/Mac
.\venv\Scripts\Activate.ps1        # Windows

# Deactivate virtual environment
deactivate

# Reinstall dependencies
pip install -r requirements.txt

# Update dependencies
pip install --upgrade -r requirements.txt
```

### Database Management

```bash
# Re-run migration (drops and recreates tables)
cd backend
source venv/bin/activate
python migrate.py

# Re-populate rooms
python populate_rooms.py

# Extract rooms from SVG again
python extract_rooms_from_svg.py
```

## 🐛 Troubleshooting

### Script Permission Denied (Linux/Mac)

```bash
chmod +x setup-backend.sh
```

### PowerShell Execution Policy Error (Windows)

Run PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Docker Container Won't Start

```bash
# Check if port 5432 is already in use
lsof -i :5432        # Linux/Mac
netstat -ano | findstr :5432    # Windows

# Stop any existing PostgreSQL services
sudo systemctl stop postgresql   # Linux
# Or kill the process using the port
```

### Python Module Not Found

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Database Connection Failed

```bash
# Check if container is running
docker ps | grep roombooking_postgres

# Check container logs
docker logs roombooking_postgres

# Restart container
docker-compose restart postgres
```

### "rooms_data.json not found"

The script should automatically extract from SVG, but if it fails:

```bash
cd backend
python extract_rooms_from_svg.py
```

## 📚 Additional Resources

- **Full Database Setup Guide:** See `DATABASE_SETUP.md` for detailed manual setup
- **API Documentation:** Visit `http://localhost:8000/docs` after starting the server
- **API Examples:** See `API_EXAMPLES.md` for request/response examples
- **Docker Compose:** See `docker-compose.yml` for container configuration

## 🆘 Getting Help

If you encounter issues:

1. Check the error message in the script output
2. Review the Docker logs: `docker logs roombooking_postgres`
3. Verify all prerequisites are installed
4. Check the `DATABASE_SETUP.md` for manual setup steps
5. Ensure ports 5432 and 8000 are not in use

## 🎊 Success!

If everything worked correctly, you should have:

- ✅ PostgreSQL running in Docker
- ✅ Database with 134 rooms
- ✅ Python virtual environment ready
- ✅ Backend ready to start

Now you can start building your frontend! 🚀

---

**Created:** November 8, 2025  
**Last Updated:** November 8, 2025
