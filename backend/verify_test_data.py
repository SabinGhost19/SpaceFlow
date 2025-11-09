"""
Script to verify test data population.
Displays statistics about the populated data.
"""
import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select, func
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.booking import Booking, booking_participants
from app.models.booking_invitation import BookingInvitation
from app.models.room import Room


async def verify_data():
    """Verify populated test data."""
    print("=" * 80)
    print("VERIFYING TEST DATA")
    print("=" * 80)
    
    async with AsyncSessionLocal() as db:
        # Count users
        result = await db.execute(select(func.count(User.id)))
        user_count = result.scalar()
        
        result = await db.execute(select(func.count(User.id)).where(User.is_manager == False))
        non_admin_count = result.scalar()
        
        result = await db.execute(select(func.count(User.id)).where(User.is_manager == True))
        admin_count = result.scalar()
        
        # Count rooms
        result = await db.execute(select(func.count(Room.id)))
        room_count = result.scalar()
        
        # Count bookings
        result = await db.execute(select(func.count(Booking.id)))
        booking_count = result.scalar()
        
        # Booking statuses
        result = await db.execute(
            select(func.count(Booking.id)).where(Booking.approval_status == 'approved')
        )
        approved_count = result.scalar()
        
        result = await db.execute(
            select(func.count(Booking.id)).where(Booking.approval_status == 'pending')
        )
        pending_count = result.scalar()
        
        result = await db.execute(
            select(func.count(Booking.id)).where(Booking.approval_status == 'rejected')
        )
        rejected_count = result.scalar()
        
        # Count participants
        result = await db.execute(select(func.count()).select_from(booking_participants))
        participant_count = result.scalar()
        
        # Count invitations
        result = await db.execute(select(func.count(BookingInvitation.id)))
        invitation_count = result.scalar()
        
        result = await db.execute(
            select(func.count(BookingInvitation.id)).where(BookingInvitation.status == 'accepted')
        )
        accepted_invitations = result.scalar()
        
        result = await db.execute(
            select(func.count(BookingInvitation.id)).where(BookingInvitation.status == 'pending')
        )
        pending_invitations = result.scalar()
        
        result = await db.execute(
            select(func.count(BookingInvitation.id)).where(BookingInvitation.status == 'rejected')
        )
        rejected_invitations = result.scalar()
        
        # Print results
        print("\n📊 DATABASE STATISTICS")
        print("-" * 80)
        
        print(f"\n👥 USERS:")
        print(f"   Total users: {user_count}")
        print(f"   Non-admin users: {non_admin_count}")
        print(f"   Admin users: {admin_count}")
        
        print(f"\n🏢 ROOMS:")
        print(f"   Total rooms: {room_count}")
        
        print(f"\n📅 BOOKINGS:")
        print(f"   Total bookings: {booking_count}")
        print(f"   ✓ Approved: {approved_count}")
        print(f"   ⏳ Pending: {pending_count}")
        print(f"   ✗ Rejected: {rejected_count}")
        
        print(f"\n👥 PARTICIPANTS:")
        print(f"   Total participant assignments: {participant_count}")
        print(f"   Average participants per booking: {participant_count / booking_count if booking_count > 0 else 0:.2f}")
        
        print(f"\n✉️ INVITATIONS:")
        print(f"   Total invitations: {invitation_count}")
        print(f"   ✓ Accepted: {accepted_invitations}")
        print(f"   ⏳ Pending: {pending_invitations}")
        print(f"   ✗ Rejected: {rejected_invitations}")
        
        print("\n" + "=" * 80)
        
        # Get sample data
        print("\n📋 SAMPLE DATA")
        print("-" * 80)
        
        # Sample users
        result = await db.execute(select(User).where(User.is_manager == False).limit(3))
        users = result.scalars().all()
        
        print("\n👤 Sample Users:")
        for user in users:
            print(f"   • {user.full_name} ({user.email})")
        
        # Sample bookings with details
        result = await db.execute(
            select(Booking)
            .where(Booking.approval_status == 'approved')
            .limit(3)
        )
        bookings = result.scalars().all()
        
        print("\n📅 Sample Approved Bookings:")
        for booking in bookings:
            await db.refresh(booking, ['room', 'user'])
            print(f"   • {booking.room.name} - {booking.booking_date} ({booking.start_time} - {booking.end_time})")
            print(f"     Organizer: {booking.user.full_name}")
        
        print("\n" + "=" * 80)
        print("✓ Verification completed!")


if __name__ == "__main__":
    asyncio.run(verify_data())
