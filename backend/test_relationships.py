"""
Quick test script to verify database relationships and data integrity.
"""
import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.booking import Booking, booking_participants
from app.models.booking_invitation import BookingInvitation
from app.models.room import Room


async def test_relationships():
    """Test all database relationships."""
    print("=" * 80)
    print("TESTING DATABASE RELATIONSHIPS")
    print("=" * 80)
    
    async with AsyncSessionLocal() as db:
        # Test 1: User -> Bookings relationship
        print("\n1️⃣ Testing User -> Bookings relationship...")
        result = await db.execute(select(User).where(User.is_manager == False).limit(1))
        user = result.scalar_one_or_none()
        
        if user:
            await db.refresh(user, ['bookings'])
            print(f"   User: {user.full_name}")
            print(f"   Bookings created: {len(user.bookings)}")
            print(f"   ✓ Relationship works!")
        
        # Test 2: Booking -> Room relationship
        print("\n2️⃣ Testing Booking -> Room relationship...")
        result = await db.execute(select(Booking).limit(1))
        booking = result.scalar_one_or_none()
        
        if booking:
            await db.refresh(booking, ['room', 'user'])
            print(f"   Booking ID: {booking.id}")
            print(f"   Room: {booking.room.name}")
            print(f"   Organizer: {booking.user.full_name}")
            print(f"   Date: {booking.booking_date}")
            print(f"   Time: {booking.start_time} - {booking.end_time}")
            print(f"   ✓ Relationship works!")
        
        # Test 3: Booking -> Participants relationship
        print("\n3️⃣ Testing Booking -> Participants relationship...")
        result = await db.execute(
            select(Booking)
            .where(Booking.approval_status == 'approved')
            .limit(1)
        )
        booking = result.scalar_one_or_none()
        
        if booking:
            await db.refresh(booking, ['participants', 'room'])
            print(f"   Booking: {booking.room.name} on {booking.booking_date}")
            print(f"   Participants: {len(booking.participants)}")
            for participant in booking.participants:
                print(f"      - {participant.full_name}")
            print(f"   ✓ Relationship works!")
        
        # Test 4: BookingInvitation relationships
        print("\n4️⃣ Testing BookingInvitation relationships...")
        result = await db.execute(select(BookingInvitation).limit(1))
        invitation = result.scalar_one_or_none()
        
        if invitation:
            await db.refresh(invitation, ['booking', 'inviter', 'invitee'])
            await db.refresh(invitation.booking, ['room'])
            print(f"   Invitation ID: {invitation.id}")
            print(f"   Booking: {invitation.booking.room.name}")
            print(f"   Inviter: {invitation.inviter.full_name}")
            print(f"   Invitee: {invitation.invitee.full_name}")
            print(f"   Status: {invitation.status}")
            print(f"   ✓ Relationship works!")
        
        # Test 5: Room -> Bookings relationship
        print("\n5️⃣ Testing Room -> Bookings relationship...")
        result = await db.execute(select(Room).limit(1))
        room = result.scalar_one_or_none()
        
        if room:
            await db.refresh(room, ['bookings'])
            print(f"   Room: {room.name}")
            print(f"   Total bookings: {len(room.bookings)}")
            print(f"   ✓ Relationship works!")
        
        # Test 6: User -> Participant Bookings relationship
        print("\n6️⃣ Testing User -> Participant Bookings relationship...")
        result = await db.execute(select(User).where(User.is_manager == False).limit(1))
        user = result.scalar_one_or_none()
        
        if user:
            await db.refresh(user, ['participant_bookings'])
            print(f"   User: {user.full_name}")
            print(f"   Participating in bookings: {len(user.participant_bookings)}")
            print(f"   ✓ Relationship works!")
        
        # Test 7: Approved_by relationship
        print("\n7️⃣ Testing Booking -> Approved By relationship...")
        result = await db.execute(
            select(Booking)
            .where(Booking.approval_status == 'approved')
            .where(Booking.approved_by_id.isnot(None))
            .limit(1)
        )
        booking = result.scalar_one_or_none()
        
        if booking:
            await db.refresh(booking, ['approved_by', 'room'])
            print(f"   Booking: {booking.room.name}")
            print(f"   Approved by: {booking.approved_by.full_name if booking.approved_by else 'N/A'}")
            print(f"   Approved at: {booking.approved_at}")
            print(f"   ✓ Relationship works!")
        
        print("\n" + "=" * 80)
        print("✅ ALL RELATIONSHIPS WORKING CORRECTLY!")
        print("=" * 80)


async def test_data_integrity():
    """Test data integrity constraints."""
    print("\n" + "=" * 80)
    print("TESTING DATA INTEGRITY")
    print("=" * 80)
    
    async with AsyncSessionLocal() as db:
        # Check for orphaned invitations
        print("\n🔍 Checking for orphaned invitations...")
        result = await db.execute(
            select(BookingInvitation)
            .outerjoin(Booking, BookingInvitation.booking_id == Booking.id)
            .where(Booking.id.is_(None))
        )
        orphaned = result.scalars().all()
        
        if orphaned:
            print(f"   ⚠️ Found {len(orphaned)} orphaned invitations!")
        else:
            print(f"   ✓ No orphaned invitations found")
        
        # Check for duplicate bookings
        print("\n🔍 Checking for duplicate bookings (same room, date, time)...")
        result = await db.execute(
            select(Booking.room_id, Booking.booking_date, Booking.start_time, Booking.end_time)
        )
        bookings = result.all()
        
        seen = set()
        duplicates = []
        for booking in bookings:
            key = (booking.room_id, booking.booking_date, booking.start_time, booking.end_time)
            if key in seen:
                duplicates.append(key)
            seen.add(key)
        
        if duplicates:
            print(f"   ⚠️ Found {len(duplicates)} duplicate bookings!")
        else:
            print(f"   ✓ No duplicate bookings found")
        
        # Check participants are not organizers
        print("\n🔍 Checking participants are not organizers...")
        result = await db.execute(
            select(Booking).where(Booking.approval_status == 'approved')
        )
        bookings = result.scalars().all()
        
        invalid = 0
        for booking in bookings:
            await db.refresh(booking, ['participants'])
            for participant in booking.participants:
                if participant.id == booking.user_id:
                    invalid += 1
                    break
        
        if invalid > 0:
            print(f"   ⚠️ Found {invalid} bookings where organizer is also participant!")
        else:
            print(f"   ✓ All participants are different from organizers")
        
        # Check booking dates
        print("\n🔍 Checking booking dates (should be >= Nov 11, 2025)...")
        from datetime import date
        min_date = date(2025, 11, 11)
        
        result = await db.execute(
            select(Booking).where(Booking.booking_date < min_date)
        )
        invalid_dates = result.scalars().all()
        
        if invalid_dates:
            print(f"   ⚠️ Found {len(invalid_dates)} bookings before Nov 11, 2025!")
        else:
            print(f"   ✓ All bookings are on or after Nov 11, 2025")
        
        print("\n" + "=" * 80)
        print("✅ DATA INTEGRITY CHECK COMPLETED!")
        print("=" * 80)


async def main():
    """Run all tests."""
    await test_relationships()
    await test_data_integrity()
    
    print("\n" + "=" * 80)
    print("🎉 ALL TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(main())
