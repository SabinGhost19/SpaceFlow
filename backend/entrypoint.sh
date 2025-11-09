#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  sleep 1
done

echo "PostgreSQL is ready!"

echo "Running migrations..."
python3 migrate.py

echo "Running avatar migration..."
python3 migrate_avatar.py

echo "Populating rooms..."
python3 populate_rooms.py

echo "Updating room images..."
python3 update_room_images.py

echo "Populating test data (users, bookings, invitations)..."
python3 populate_test_data.py

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
