const Map3D = ({ selectedRoom }) => {
  return (
    <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg p-6 h-full">
      {/* Floating foam bubbles (Easter egg) */}
      <div className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden">
        <div
          className="absolute left-[10%] top-[15%] w-3 h-3 bg-white rounded-full opacity-60 animate-float"
        />
        <div
          className="absolute right-[15%] top-[25%] w-4 h-4 bg-white rounded-full opacity-50 animate-float"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute left-[20%] bottom-[20%] w-2 h-2 bg-white rounded-full opacity-70 animate-float"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute right-[25%] bottom-[30%] w-3 h-3 bg-white rounded-full opacity-55 animate-float"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-amber-900 mb-2">
            3D Floor Plan
          </h3>
          <p className="text-sm text-amber-700">
            Interactive 3D visualization coming soon
          </p>
          {selectedRoom && (
            <div className="mt-2 inline-block bg-amber-200 px-3 py-1 rounded-full text-sm text-amber-900 font-medium">
              Viewing: {selectedRoom.name}
            </div>
          )}
        </div>

        {/* Drone Scene Placeholder */}
        <div
          className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg shadow-inner overflow-hidden relative flex items-center justify-center"
          style={{ minHeight: '400px' }}
        >
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🚁</div>
            <p className="text-gray-700 font-semibold text-lg">Drone Scene</p>
            <p className="text-sm text-gray-500 mt-2">
              3D visualization prototype
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-amber-800">
          <span className="font-mono bg-amber-100 px-2 py-1 rounded">
            Prototype View
          </span>
          <span className="text-amber-600">
            3D effects will be added later
          </span>
        </div>
      </div>
    </div>
  );
};

export default Map3D;
