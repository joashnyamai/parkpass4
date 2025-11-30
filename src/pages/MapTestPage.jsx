/**
 * MAP TEST PAGE
 * Simple page to test map rendering
 */

import ParkingMapWorking from '../components/ParkingMapWorking';

const MapTestPage = () => {
  // Test data
  const testSpaces = [
    {
      id: '1',
      name: 'Test Parking 1',
      location: 'Nairobi CBD',
      coordinates: { lat: -1.286389, lng: 36.817223 },
      status: 'available',
      availableSpots: 5,
      price: 100
    },
    {
      id: '2',
      name: 'Test Parking 2',
      location: 'Westlands',
      coordinates: { lat: -1.2674, lng: 36.8103 },
      status: 'available',
      availableSpots: 3,
      price: 150
    },
    {
      id: '3',
      name: 'Test Parking 3',
      location: 'Kilimani',
      coordinates: { lat: -1.2921, lng: 36.7872 },
      status: 'available',
      availableSpots: 0,
      price: 120
    }
  ];

  const testUserLocation = { lat: -1.286389, lng: 36.817223 };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Map Test Page</h1>
        <p className="text-gray-600 mb-8">
          Testing map rendering with {testSpaces.length} parking spaces
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-4" style={{ height: '700px' }}>
          <ParkingMapWorking
            parkingSpaces={testSpaces}
            userLocation={testUserLocation}
            onSpaceSelect={(space) => console.log('Selected:', space)}
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Debug Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Parking Spaces:</strong> {testSpaces.length}</p>
            <p><strong>User Location:</strong> {JSON.stringify(testUserLocation)}</p>
            <p><strong>Google Maps API Key:</strong> {import.meta.env.VITE_MAPS_API_KEY ? '✅ Set' : '❌ Not Set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapTestPage;
