"""
Script to populate database with test data: users, bookings, and booking invitations.
Creates realistic test data for development and testing.
"""
import asyncio
import random
import sys
from pathlib import Path
from datetime import datetime, date, time, timedelta

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select, delete
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.booking import Booking, booking_participants
from app.models.booking_invitation import BookingInvitation
from app.models.room import Room
from app.core.security import get_password_hash


# Test users data (non-admin users)
TEST_USERS = [
    {
        "email": "john.doe@company.com",
        "username": "john_doe",
        "full_name": "John Doe",
        "password": "password123",
        "is_manager": False,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=john"
    },
    {
        "email": "jane.smith@company.com",
        "username": "jane_smith",
        "full_name": "Jane Smith",
        "password": "password123",
        "is_manager": False,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=jane"
    },
    {
        "email": "mike.johnson@company.com",
        "username": "mike_johnson",
        "full_name": "Mike Johnson",
        "password": "password123",
        "is_manager": False,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=mike"
    },
    {
        "email": "sarah.williams@company.com",
        "username": "sarah_williams",
        "full_name": "Sarah Williams",
        "password": "password123",
        "is_manager": False,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
    },
    {
        "email": "david.brown@company.com",
        "username": "david_brown",
        "full_name": "David Brown",
        "password": "password123",
        "is_manager": False,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=david"
    },
    {
        "email": "emily.davis@company.com",
        "username": "emily_davis",
        "full_name": "Emily Davis",
        "password": "password123",
        "is_manager": False,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=emily"
    },
    {
        "email": "alex.miller@company.com",
        "username": "alex_miller",
        "full_name": "Alex Miller",
        "password": "password123",
        "is_manager": False,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
    },
    {
        "email": "lisa.wilson@company.com",
        "username": "lisa_wilson",
        "full_name": "Lisa Wilson",
        "password": "password123",
        "is_manager": False,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa"
    },
    {
        "email": "robert.moore@company.com",
        "username": "robert_moore",
        "full_name": "Robert Moore",
        "password": "password123",
        "is_manager": False,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=robert"
    },
    {
        "email": "jennifer.taylor@company.com",
        "username": "jennifer_taylor",
        "full_name": "Jennifer Taylor",
        "password": "password123",
        "is_manager": False,
        "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer"
    }
]

# Time slots for bookings (working hours: 9 AM - 6 PM)
TIME_SLOTS = [
    (time(9, 0), time(10, 0)),
    (time(10, 0), time(11, 0)),
    (time(11, 0), time(12, 0)),
    (time(12, 0), time(13, 0)),
    (time(13, 0), time(14, 0)),
    (time(14, 0), time(15, 0)),
    (time(15, 0), time(16, 0)),
    (time(16, 0), time(17, 0)),
    (time(17, 0), time(18, 0)),
    # Longer meetings
    (time(9, 0), time(11, 0)),
    (time(11, 0), time(13, 0)),
    (time(13, 0), time(15, 0)),
    (time(14, 0), time(16, 0)),
    (time(15, 0), time(17, 0)),
    # Extended meetings
    (time(9, 0), time(12, 0)),
    (time(13, 0), time(17, 0)),
]

APPROVAL_STATUSES = ['pending', 'approved', 'rejected']
BOOKING_STATUSES = ['upcoming', 'completed', 'cancelled']


async def clear_test_data(db):
    """Clear existing test data from database."""
    print("Clearing existing test data...")
    
    try:
        # Delete in correct order to respect foreign key constraints
        await db.execute(delete(BookingInvitation))
        await db.execute(delete(booking_participants))
        await db.execute(delete(Booking))
        
        # Delete only non-admin users
        result = await db.execute(
            delete(User).where(User.is_manager == False)
        )
        
        await db.commit()
        print("✓ Test data cleared successfully")
    except Exception as e:
        await db.rollback()
        print(f"✗ Error clearing test data: {e}")
        raise


async def create_users(db):
    """Create test users."""
    print("\nCreating test users...")
    created_users = []
    
    for user_data in TEST_USERS:
        try:
            # Check if user already exists
            result = await db.execute(
                select(User).where(User.email == user_data['email'])
            )
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print(f"⊘ User {user_data['email']} already exists, skipping")
                created_users.append(existing_user)
                continue
            
            # Create new user
            user = User(
                email=user_data['email'],
                username=user_data['username'],
                full_name=user_data['full_name'],
                hashed_password=get_password_hash(user_data['password']),
                is_manager=user_data['is_manager'],
                avatar_url=user_data['avatar_url'],
                is_active=True
            )
            
            db.add(user)
            await db.flush()
            created_users.append(user)
            
            print(f"✓ Created user: {user.full_name} ({user.email})")
            
        except Exception as e:
            print(f"✗ Error creating user {user_data['email']}: {e}")
            await db.rollback()
            raise
    
    await db.commit()
    print(f"\n✓ Successfully created {len(created_users)} users")
    return created_users


async def get_all_rooms(db):
    """Get all rooms from database."""
    result = await db.execute(select(Room).where(Room.is_available == True))
    rooms = result.scalars().all()
    return rooms


async def create_bookings(db, users, rooms):
    """Create random bookings for users."""
    print("\nCreating bookings...")
    
    if not rooms:
        print("✗ No rooms found in database. Please run populate_rooms.py first.")
        return []
    
    created_bookings = []
    today = date.today()
    
    # Don't create bookings for today (Nov 9) and tomorrow (Nov 10)
    # Start from Nov 11, 2025
    start_date = date(2025, 11, 11)
    
    # Create bookings for the next 2 weeks (14 days)
    end_date = start_date + timedelta(days=13)
    
    print(f"Creating bookings from {start_date} to {end_date}")
    print(f"Total rooms available: {len(rooms)}")
    print(f"Total users: {len(users)}")
    
    booking_count = 0
    target_bookings = 100  # Approximately 100 bookings over 2 weeks
    
    # Generate bookings
    current_date = start_date
    while current_date <= end_date and booking_count < target_bookings:
        # Skip weekends (Saturday=5, Sunday=6)
        if current_date.weekday() >= 5:
            current_date += timedelta(days=1)
            continue
        
        # Create 5-10 random bookings per day
        daily_bookings = random.randint(5, 10)
        
        for _ in range(daily_bookings):
            try:
                # Random room and user
                room = random.choice(rooms)
                organizer = random.choice(users)
                
                # Random time slot
                start_time, end_time = random.choice(TIME_SLOTS)
                
                # Check if this slot is already booked for this room
                result = await db.execute(
                    select(Booking).where(
                        Booking.room_id == room.id,
                        Booking.booking_date == current_date,
                        Booking.start_time == start_time,
                        Booking.end_time == end_time
                    )
                )
                existing_booking = result.scalar_one_or_none()
                
                if existing_booking:
                    continue  # Skip if slot already booked
                
                # Random approval status
                approval_status = random.choice(APPROVAL_STATUSES)
                approved_by_id = None
                approved_at = None
                rejection_reason = None
                
                if approval_status == 'approved':
                    # Find a manager to approve (or use a random user if no managers)
                    manager_result = await db.execute(
                        select(User).where(User.is_manager == True).limit(1)
                    )
                    manager = manager_result.scalar_one_or_none()
                    if manager:
                        approved_by_id = manager.id
                        approved_at = datetime.now() - timedelta(days=random.randint(0, 5))
                elif approval_status == 'rejected':
                    manager_result = await db.execute(
                        select(User).where(User.is_manager == True).limit(1)
                    )
                    manager = manager_result.scalar_one_or_none()
                    if manager:
                        approved_by_id = manager.id
                        approved_at = datetime.now() - timedelta(days=random.randint(0, 5))
                        rejection_reason = random.choice([
                            "Room maintenance scheduled",
                            "Conflicting priority booking",
                            "Insufficient justification",
                            "Room capacity exceeded"
                        ])
                
                # Booking status
                if current_date < today:
                    booking_status = 'completed'
                elif approval_status == 'rejected':
                    booking_status = 'cancelled'
                else:
                    booking_status = 'upcoming'
                
                # Create booking
                booking = Booking(
                    room_id=room.id,
                    user_id=organizer.id,
                    booking_date=current_date,
                    start_time=start_time,
                    end_time=end_time,
                    approval_status=approval_status,
                    approved_by_id=approved_by_id,
                    approved_at=approved_at,
                    rejection_reason=rejection_reason,
                    status=booking_status
                )
                
                db.add(booking)
                await db.flush()
                
                # Add participants (if room capacity > 1 and approved)
                if room.capacity > 1 and approval_status == 'approved':
                    # Add 1 to (capacity-1) random participants
                    num_participants = random.randint(1, min(room.capacity - 1, len(users) - 1))
                    
                    # Get random participants excluding the organizer
                    available_participants = [u for u in users if u.id != organizer.id]
                    participants = random.sample(available_participants, num_participants)
                    
                    for participant in participants:
                        # Add to booking_participants table
                        await db.execute(
                            booking_participants.insert().values(
                                booking_id=booking.id,
                                user_id=participant.id
                            )
                        )
                        
                        # Create booking invitation
                        invitation_status = random.choice(['pending', 'accepted', 'accepted', 'rejected'])  # More likely to be accepted
                        
                        invitation = BookingInvitation(
                            booking_id=booking.id,
                            inviter_id=organizer.id,
                            invitee_id=participant.id,
                            status=invitation_status,
                            is_read=random.choice([True, False]),
                            responded_at=datetime.now() - timedelta(days=random.randint(0, 3)) if invitation_status != 'pending' else None
                        )
                        
                        db.add(invitation)
                
                created_bookings.append(booking)
                booking_count += 1
                
                if booking_count % 10 == 0:
                    print(f"  Created {booking_count} bookings...")
                
            except Exception as e:
                print(f"✗ Error creating booking: {e}")
                await db.rollback()
                raise
        
        current_date += timedelta(days=1)
    
    await db.commit()
    print(f"\n✓ Successfully created {len(created_bookings)} bookings")
    
    # Print statistics
    approved_count = sum(1 for b in created_bookings if b.approval_status == 'approved')
    pending_count = sum(1 for b in created_bookings if b.approval_status == 'pending')
    rejected_count = sum(1 for b in created_bookings if b.approval_status == 'rejected')
    
    print(f"\nBooking Statistics:")
    print(f"  ✓ Approved: {approved_count}")
    print(f"  ⏳ Pending: {pending_count}")
    print(f"  ✗ Rejected: {rejected_count}")
    
    return created_bookings


async def populate_test_data():
    """Main function to populate all test data."""
    print("=" * 80)
    print("POPULATING TEST DATA")
    print("=" * 80)
    
    async with AsyncSessionLocal() as db:
        try:
            # Clear existing test data
            await clear_test_data(db)
            
            # Create users
            users = await create_users(db)
            
            # Get all rooms
            rooms = await get_all_rooms(db)
            
            if not rooms:
                print("\n✗ No rooms found. Please run populate_rooms.py first.")
                return
            
            # Create bookings with participants and invitations
            bookings = await create_bookings(db, users, rooms)
            
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            print(f"✓ Users created: {len(users)}")
            print(f"✓ Rooms available: {len(rooms)}")
            print(f"✓ Bookings created: {len(bookings)}")
            print("=" * 80)
            print("\n✓ Test data population completed successfully!")
            
        except Exception as e:
            await db.rollback()
            print(f"\n✗ Error populating test data: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(populate_test_data())
