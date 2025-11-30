/**
 * HOME PAGE - Enhanced Professional Version
 * Modern UI with advanced features
 */
import { useState, useMemo } from "react";
import { MapPin, Search, Sparkles, Grid3x3, Map, Filter, X } from "lucide-react";
import { useParkingContext } from "../contexts/ParkingContext";
import { useAIRecommendations } from "../hooks/useAIRecommendations";
import { useParkingRecommendations } from "../hooks/useParkingRecommendations";
import AIRecommendationCard from "../components/AIRecommendationCard";
import ParkingSpaceCard from "../components/ParkingSpaceCard";
import ParkingMapLeafletWorking from "../components/ParkingMapLeafletWorking";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";

const Home = () => {
  const { parkingSpaces, userLocation, loading } = useParkingContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [viewMode, setViewMode] = useState('map');
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    minRating: 0,
    features: [],
    sortBy: 'distance'
  });
  const [showFilters, setShowFilters] = useState(false);
  
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
  const preferences = useMemo(() => ({ sortBy: filters.sortBy }), [filters.sortBy]);
  const { recommendations } = useParkingRecommendations(parkingSpaces, userLocation, preferences);

  // Apply filters and search
  const filteredSpaces = useMemo(() => {
    return recommendations.filter(space => {
      // Search filter
      const matchesSearch = !searchTerm || 
        space.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Price filter
      const matchesPrice = space.price >= filters.priceRange[0] && 
                          space.price <= filters.priceRange[1];
      
      // Rating filter
      const matchesRating = (space.rating || 0) >= filters.minRating;
      
      // Features filter
      const matchesFeatures = filters.features.length === 0 || 
        filters.features.every(f => space.features?.includes(f));
      
      return matchesSearch && matchesPrice && matchesRating && matchesFeatures;
    });
  }, [recommendations, searchTerm, filters]);

  // Calculate stats
  const availableSpaces = parkingSpaces.filter(s => s.status === 'available' && s.availableSpots > 0);
  const avgPrice = parkingSpaces.length > 0 
    ? Math.round(parkingSpaces.reduce((sum, s) => sum + s.price, 0) / parkingSpaces.length)
    : 0;

  if (loading) {
    return <LoadingSpinner fullScreen size="xl" text="Loading parking spaces..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-green-700 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-10 animate-slide-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Parking Spot
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              Smart recommendations • Real-time availability • Secure booking
            </p>
            {userLocation && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                <MapPin className="w-4 h-4" />
                <span>Showing parking near your location</span>
              </div>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-2xl shadow-2xl p-3 flex items-center gap-3">
              <Search className="w-6 h-6 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="Search by location or parking name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-4 text-gray-800 text-lg focus:outline-none"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-gray-400 hover:text-gray-600 px-3"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-4 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{parkingSpaces.length}</div>
              <div className="text-sm text-blue-100">Total Spots</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{availableSpaces.length}</div>
              <div className="text-sm text-blue-100">Available Now</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">KES {avgPrice}</div>
              <div className="text-sm text-blue-100">Avg Price/hr</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-blue-100">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section */}
      {aiRecommendations.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-slide-in-up">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  AI-Powered Recommendations
                </h2>
                <p className="text-gray-600">
                  Smart suggestions based on your location and preferences
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {aiRecommendations.map((space, index) => (
              <div key={space.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <AIRecommendationCard 
                  space={space}
                  showAIDetails={true}
                  rank={index + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* View Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MapPin className="w-8 h-8 text-blue-600" />
              {aiRecommendations.length > 0 ? 'All Available Parking' : 'Available Parking Spots'}
            </h2>
            <p className="text-gray-600 mt-2">
              Showing <span className="font-bold text-blue-600">{filteredSpaces.length}</span> of {parkingSpaces.length} spots
              {userLocation && ' • Sorted by distance'}
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex gap-2 bg-white rounded-xl shadow-soft p-1.5 border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium ${
                viewMode === 'map' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Map className="w-5 h-5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {parkingSpaces.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-soft">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Parking Spaces Yet</h3>
            <p className="text-gray-500 mb-6">
              Admin needs to add parking spaces to get started
            </p>
          </div>
        ) : filteredSpaces.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-soft">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Matching Results</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters({
                  priceRange: [0, 1000],
                  minRating: 0,
                  features: [],
                  sortBy: 'distance'
                });
              }}
              className="btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpaces.map((space, index) => (
                  <div key={space.id} className="animate-slide-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <ParkingSpaceCard 
                      space={space} 
                      distance={space.distance}
                      showNavigation={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Map View */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200" style={{ height: '700px' }}>
                    <ParkingMapLeafletWorking
                      parkingSpaces={filteredSpaces}
                      userLocation={userLocation}
                      onSpaceSelect={setSelectedSpace}
                    />
                  </div>
                </div>
                
                {/* Selected Space Details */}
                <div className="lg:col-span-1">
                  {selectedSpace ? (
                    <div className="animate-slide-in-up">
                      <ParkingSpaceCard 
                        space={selectedSpace} 
                        distance={selectedSpace.distance}
                        showNavigation={true}
                      />
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-soft p-8 text-center border border-gray-200">
                      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Select a Parking Spot</h3>
                      <p className="text-gray-600 text-sm">
                        Click on any marker on the map to view parking details and book
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white py-20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ParkPass?</h2>
            <p className="text-xl text-gray-600">The smartest way to park in Kenya</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered</h3>
              <p className="text-gray-600">Smart recommendations based on your preferences and location</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">Live availability and instant booking confirmation</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Easy to Use</h3>
              <p className="text-gray-600">Simple search, quick booking, and secure payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
