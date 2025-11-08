import { useState, useEffect, useRef } from 'react';
import Map3D from '../components/Map3D';
import RoomList from '../components/RoomList';
import { ToastContainer } from '../components/Toast';
import { BottleCapIcon } from '../components/Icons';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.roombooking.local';

const BookingPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [booking, setBooking] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastIdCounter = useRef(0);

  // Toast notification system
  const showToast = ({ title = 'Notice', message = '', intent = 'info', duration = 4000 }) => {
    const id = ++toastIdCounter.current;
    setToasts((prev) => [...prev, { id, title, message, intent, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch rooms
  useEffect(() => {
    let mounted = true;
    setLoadingRooms(true);

    // Simulate API call - replace with real fetch
    setTimeout(() => {
      if (!mounted) return;

      // Mock data
      setRooms([
        {
          id: 'R-101',
          name: 'Hops Boardroom',
          capacity: 8,
          price: 120,
          features: ['4K Projector', 'Whiteboard', 'Video Conf'],
          available: true,
        },
        {
          id: 'R-102',
          name: 'Amber Suite',
          capacity: 12,
          price: 180,
          features: ['Dual Monitors', 'Coffee Bar', 'Natural Light'],
          available: true,
        },
        {
          id: 'R-103',
          name: 'Stout Studio',
          capacity: 6,
          price: 90,
          features: ['Quiet Space', 'Standing Desk', 'Soundproof'],
          available: false,
        },
        {
          id: 'R-104',
          name: 'Pilsner Parlor',
          capacity: 10,
          price: 150,
          features: ['Smart Board', 'Breakout Area', 'Mini Fridge'],
          available: true,
        },
        {
          id: 'R-105',
          name: 'Lager Lounge',
          capacity: 15,
          price: 200,
          features: ['Video Wall', 'Recording', 'Catering'],
          available: true,
        },
        {
          id: 'R-106',
          name: 'Porter Pod',
          capacity: 4,
          price: 75,
          features: ['Private', 'Phone Booth', 'Focus Space'],
          available: true,
        },
      ]);

      setLoadingRooms(false);
    }, 1200);

    return () => {
      mounted = false;
    };
  }, []);

  // Book room handler
  const handleBookRoom = async (room) => {
    if (!room.available) {
      showToast({
        title: 'Unavailable',
        message: `${room.name} is currently unavailable.`,
        intent: 'error',
      });
      return;
    }

    setBooking({ roomId: room.id, status: 'pending' });
    showToast({
      title: 'Processing...',
      message: `Reserving ${room.name}...`,
      intent: 'info',
      duration: 2000,
    });

    try {
      // Simulate API call - replace with real fetch
      // const response = await fetch(`${API_BASE}/book`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ roomId: room.id, timestamp: Date.now() }),
      // });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setBooking({ roomId: room.id, status: 'success' });
      showToast({
        title: 'Booking Confirmed! 🍺',
        message: `${room.name} reserved successfully. Cheers!`,
        intent: 'success',
      });

      // Update room availability
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, available: false } : r))
      );

      // Clear booking status after animation
      setTimeout(() => setBooking(null), 2000);
    } catch (error) {
      setBooking({ roomId: room.id, status: 'error' });
      showToast({
        title: 'Booking Failed',
        message: `Unable to reserve ${room.name}. Please try again.`,
        intent: 'error',
      });

      setTimeout(() => setBooking(null), 2000);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BottleCapIcon className="w-10 h-10 animate-spin-slow" />
            <h1 className="text-4xl font-bold text-amber-900">
              Book Your Meeting Room
            </h1>
            <BottleCapIcon className="w-10 h-10 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          </div>
          <p className="text-amber-700 text-lg">
            Explore rooms in 3D and reserve your perfect space
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: 3D Model Preview */}
          <div className="bg-white rounded-lg shadow-lg p-8 transition-all duration-300 hover:shadow-xl h-fit lg:sticky lg:top-24">
            <Map3D
              modelPath="/models/beer-room.glb"
              selectedRoom={selectedRoom}
            />

            {/* Selected Room Details */}
            {selectedRoom && (
              <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border-2 border-amber-200 transition-all duration-300">
                <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <BottleCapIcon className="w-6 h-6" />
                  {selectedRoom.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-amber-700 font-medium">Capacity:</span>
                    <span className="text-amber-900 ml-2">{selectedRoom.capacity} people</span>
                  </div>
                  <div>
                    <span className="text-amber-700 font-medium">Price:</span>
                    <span className="text-amber-900 ml-2">${selectedRoom.price}/hour</span>
                  </div>
                </div>
                <div>
                  <span className="text-amber-700 font-medium text-sm">Features:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRoom.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-white px-3 py-1 rounded-full text-xs text-amber-800 shadow-sm border border-amber-200"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Room List */}
          <RoomList
            rooms={rooms}
            loading={loadingRooms}
            selectedRoom={selectedRoom}
            booking={booking}
            onSelectRoom={setSelectedRoom}
            onBookRoom={handleBookRoom}
            onShowToast={showToast}
          />
        </div>

        {/* Info Bar */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-amber-900 mb-1">
                Need Help?
              </h3>
              <p className="text-sm text-amber-700">
                Contact our 24/7 support team at{' '}
                <a href="mailto:support@beerroombooking.com" className="underline hover:text-amber-900">
                  support@beerroombooking.com
                </a>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-900">{rooms.length}</div>
                <div className="text-xs text-amber-600">Total Rooms</div>
              </div>
              <div className="w-px h-12 bg-amber-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {rooms.filter((r) => r.available).length}
                </div>
                <div className="text-xs text-amber-600">Available Now</div>
              </div>
              <div className="w-px h-12 bg-amber-200"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-900">
                  ${Math.min(...rooms.map((r) => r.price))}+
                </div>
                <div className="text-xs text-amber-600">Starting Price</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Screen reader only announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {toasts.length > 0 && `${toasts[toasts.length - 1].title}: ${toasts[toasts.length - 1].message}`}
      </div>
    </div>
  );
};

export default BookingPage;
