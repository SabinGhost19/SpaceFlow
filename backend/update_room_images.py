"""
Script to update room images in the database.
"""
import asyncio
from sqlalchemy import select, update
from app.database import AsyncSessionLocal
from app.models.room import Room


async def update_room_images():
    """Update room images for specific room types."""
    
    # Mapping of room types to their image URLs
    room_type_images = {
        "BeerPoint": "https://images.unsplash.com/photo-1546622891-02c72c1537b6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=3270",
        "MeetingRoom": "https://images.unsplash.com/photo-1637665662134-db459c1bbb46?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=3271",
        "PhoneBoothArea": "https://images.unsplash.com/photo-1716703435698-031227389c1c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1287",
        "Billiard": "https://media.istockphoto.com/id/2207725473/photo/group-of-young-business-people-playing-pool-in-the-office.jpg?s=612x612&w=0&k=20&c=xyiEerPp-x80lykpT_VE_oL-75X_sIU0RUioJeXVIpw=",
        "CoffeePoint": "https://2517383.fs1.hubspotusercontent-na1.net/hubfs/2517383/Office%20Coffee%20Service%20101_%20The%20Ultimate%20Guide.png",
        "DeskSeat": "https://www.desmon.com/wp-content/uploads/2023/02/distribucion-mesas-oficina.jpg",
        "ManagerDesk": "https://onedesk.com/wp-content/uploads/2016/01/photo-1556761175-b413da4baf72.jpeg"
    }
    
    async with AsyncSessionLocal() as session:
        for room_type, image_url in room_type_images.items():
            # Get all rooms of this type
            result = await session.execute(
                select(Room).where(Room.name.like(f"{room_type}%"))
            )
            rooms = result.scalars().all()
            
            if rooms:
                print(f"\nUpdating {len(rooms)} rooms of type '{room_type}':")
                
                for room in rooms:
                    room.image = image_url
                    print(f"  ✓ Updated {room.name}")
                
                await session.commit()
                print(f"✅ Successfully updated {len(rooms)} {room_type} room(s)")
            else:
                print(f"⚠️  No rooms found for type '{room_type}'")
    
    print("\n🎉 All room images updated successfully!")


if __name__ == "__main__":
    print("🔄 Starting room image update...\n")
    asyncio.run(update_room_images())
