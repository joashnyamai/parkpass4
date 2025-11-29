/**
 * HOME PAGE - Refactored with AI Recommendations
 * Uses AI-powered recommendation engine
 */
import { useState, useMemo } from "react";
import { MapPin, Search, Sparkles, TrendingUp } from "lucide-react";
import { useParkingContext } from "../contexts/ParkingContext";
import { useAIRecommendations } from "../hooks/useAIRecommendations";
import { useParkingRecommendations } from "../hooks/useParkingRecommendations";
import AIRecommendationCard from "../components/AIRecommendationCard";
import ParkingSpaceCard from "../components/ParkingSpaceCard";
import ParkingMapbox from "../components/ParkingMapbox";

const Home = () => {
  const { parkingSpaces, userLocation, loading } = useParkingContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'grid' or 'map' - default to map with Mapbox
  
  // Use AI recommendations hook
  const { 
    recommendations: aiRecommendations, 
    loading: aiLoading 
  } = useAIRecommendations(parkingSpaces, userLocation, {
    maxResults: 3,
    minScore: 50,
    usePersonalization: true
  });
  
  // Use basic recommendations for fallback
  const preferences = useMemo(() => ({ sortBy: 'distance' }), []);
  const { recommendations } = useParkingRecommendations(parkingSpaces, userLocation, preferences);

  // Filter parking spaces based on search
  const filteredSpaces = recommendations.filter(space =>
    space.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parking spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Find Your Perfect Parking Spot
            </h1>
            <p className="text-xl mb-2">
              Smart recommendations • Real-time availability • Secure booking
            </p>
            {userLocation && (
              <p className="text-sm text-blue-100">
                📍 Showing parking near your location
              </p>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-2 flex items-center">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="Search by location or parking name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 text-gray-800 focus:outline-none"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-gray-400 hover:text-gray-600 px-3"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {aiLoading ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading AI recommendations...</p>
          </div>
        ) : aiRecommendations.length > 0 ? (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    🤖 AI-Powered Recommendations
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Smart suggestions based on location, availability, and your preferences
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {aiRecommendations.map((space, index) => (
                <AIRecommendationCard 
                  key={space.id} 
                  space={space}
                  showAIDetails={true}
                  rank={index + 1}
                />
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6"></div>
          </>
        ) : parkingSpaces.length > 0 ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                <strong>AI Recommendations:</strong> {!userLocation ? 'Enable location access to get personalized parking suggestions' : 'Calculating recommendations...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              No parking spaces available for AI recommendations
            </p>
          </div>
        )}
      </div>

      {/* View Toggle and Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              {aiRecommendations.length > 0 ? 'All Available Parking' : 'Available Parking Spots'}
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredSpaces.length} of {parkingSpaces.length} spots available
              {userLocation && recommendations.length > 0 && ' • Sorted by distance'}
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'map' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Map View
            </button>
          </div>
        </div>

        {parkingSpaces.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Parking Spaces Yet</h3>
            <p className="text-gray-500 mb-4">
              Admin needs to add parking spaces to get started
            </p>
          </div>
        ) : filteredSpaces.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Results</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms</p>
            <button
              onClick={() => setSearchTerm("")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpaces.map((space) => (
                  <ParkingSpaceCard 
                    key={space.id} 
                    space={space} 
                    distance={space.distance}
                    showNavigation={true}
                  />
                ))}
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Map View */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '600px' }}>
                    <ParkingMapbox
                      parkingSpaces={filteredSpaces}
                      userLocation={userLocation}
                      onSpaceSelect={setSelectedSpace}
                      selectedSpace={selectedSpace}
                    />
                  </div>
                </div>
                
                {/* Selected Space Details */}
                <div className="lg:col-span-1">
                  {selectedSpace ? (
                    <ParkingSpaceCard 
                      space={selectedSpace} 
                      distance={selectedSpace.distance}
                      showNavigation={true}
                    />
                  ) : (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                      <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-600">
                        Click on a marker to view parking details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
