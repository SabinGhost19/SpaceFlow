import { Link, useLocation } from 'react-router-dom';
import { BottleCapIcon, BeerMugIcon } from './Icons';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
          >
            <BottleCapIcon className="w-8 h-8 group-hover:animate-spin-slow" />
            <span className="text-xl font-bold text-amber-900">
              SpaceFlow
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-amber-100 text-amber-900 font-semibold'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </Link>

            <Link
              to="/booking"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/booking'
                  ? 'bg-amber-600 text-white font-semibold shadow-md'
                  : 'bg-amber-500 text-white hover:bg-amber-600 shadow'
              }`}
            >
              <BeerMugIcon className="w-5 h-5" />
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
