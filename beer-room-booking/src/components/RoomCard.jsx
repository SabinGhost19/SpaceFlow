import { BeerMugIcon, PeopleIcon } from './Icons';

const RoomCard = ({ room, isSelected, isBooking, onSelect, onBook }) => {
  const bookingSuccess = isBooking && isBooking.status === 'success';
  const bookingError = isBooking && isBooking.status === 'error';
  const bookingPending = isBooking && isBooking.status === 'pending';

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`${room.name}, capacity ${room.capacity}, ${room.available ? 'available' : 'unavailable'}`}
      onClick={() => onSelect(room)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (room.available) onBook(room);
        }
      }}
      className={`
        relative group rounded-lg p-6 border-2 transition-all duration-200 cursor-pointer
        ${
          isSelected
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 shadow-md'
            : 'bg-gray-50 border-gray-200 hover:border-amber-300 hover:bg-amber-50'
        }
        ${!room.available ? 'opacity-60' : ''}
        ${bookingSuccess ? 'ring-4 ring-green-300' : ''}
        ${bookingError ? 'ring-4 ring-red-300' : ''}
        focus:outline-none focus:ring-4 focus:ring-amber-300
        transform hover:scale-[1.02] active:scale-[0.98]
      `}
    >
      {/* Room Icon */}
      <div className="absolute top-4 right-4">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
            ${room.available ? 'bg-amber-100 group-hover:bg-amber-200' : 'bg-gray-200'}
          `}
        >
          <BeerMugIcon
            className={room.available ? 'text-amber-600' : 'text-gray-400'}
          />
        </div>
      </div>

      <div className="pr-12">
        <h3 className="text-lg font-bold text-amber-900 mb-2">
          {room.name}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-amber-700 mb-3">
          <span className="flex items-center gap-1">
            <PeopleIcon className="w-4 h-4" />
            {room.capacity}
          </span>
          <span className="font-semibold">${room.price}/hr</span>
          <span
            className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${room.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            `}
          >
            {room.available ? 'Available' : 'Booked'}
          </span>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {room.features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="bg-white px-2 py-1 rounded text-xs text-amber-800 border border-amber-200"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Book Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBook(room);
          }}
          disabled={!room.available || bookingPending}
          className={`
            w-full py-2 px-4 rounded font-medium text-sm transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-offset-2
            ${
              room.available && !bookingPending
                ? 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 focus:ring-amber-300 shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            ${bookingPending ? 'animate-pulse' : ''}
          `}
          aria-label={`Book ${room.name}`}
        >
          {bookingPending
            ? 'Booking...'
            : bookingSuccess
            ? '✓ Booked!'
            : bookingError
            ? 'Try Again'
            : room.available
            ? 'Book Now'
            : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
