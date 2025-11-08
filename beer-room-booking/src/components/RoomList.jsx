import { useRef, useEffect } from 'react';
import RoomCard from './RoomCard';
import { RoomCardSkeleton } from './LoadingSkeleton';
import { StarIcon, ShareIcon } from './Icons';

const RoomList = ({ 
  rooms, 
  loading, 
  selectedRoom, 
  booking, 
  onSelectRoom, 
  onBookRoom,
  onShowToast 
}) => {
  const listRef = useRef(null);

  // Keyboard navigation
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement || rooms.length === 0) return;

    const handleKeyDown = (e) => {
      const focused = document.activeElement;
      const roomIndex = focused?.dataset?.roomIndex;
      
      if (roomIndex == null) return;

      const currentIndex = Number(roomIndex);
      let nextIndex = currentIndex;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextIndex = Math.min(currentIndex + 1, rooms.length - 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        nextIndex = Math.max(currentIndex - 1, 0);
      } else {
        return;
      }

      if (nextIndex !== currentIndex) {
        e.preventDefault();
        const nextElement = listElement.querySelector(`[data-room-index="${nextIndex}"]`);
        nextElement?.focus();
      }
    };

    listElement.addEventListener('keydown', handleKeyDown);
    return () => listElement.removeEventListener('keydown', handleKeyDown);
  }, [rooms]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-amber-900">
            Available Rooms
          </h2>
          <p className="text-sm text-amber-600 mt-1">
            Use arrow keys to navigate • Enter to book
          </p>
        </div>
        <div className="bg-amber-100 px-3 py-1 rounded text-xs text-amber-800 font-medium">
          8px Grid System
        </div>
      </div>

      {/* Room List */}
      <div
        ref={listRef}
        role="list"
        aria-label="Available meeting rooms"
        className="space-y-4"
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <RoomCardSkeleton key={idx} />
          ))
        ) : (
          rooms.map((room, idx) => (
            <div key={room.id} data-room-index={idx}>
              <RoomCard
                room={room}
                isSelected={selectedRoom?.id === room.id}
                isBooking={booking?.roomId === room.id ? booking : null}
                onSelect={onSelectRoom}
                onBook={onBookRoom}
              />
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 pt-6 border-t-2 border-amber-100">
        <h3 className="text-sm font-semibold text-amber-900 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              onShowToast({
                title: 'Favorites Saved',
                message: 'Your favorite rooms have been saved.',
                intent: 'success',
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 transition-colors duration-150"
          >
            <StarIcon className="w-4 h-4" />
            Save Favorites
          </button>
          <button
            onClick={() =>
              onShowToast({
                title: 'Link Copied',
                message: 'Sharing link copied to clipboard.',
                intent: 'info',
              })
            }
            className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-150"
          >
            <ShareIcon className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomList;
