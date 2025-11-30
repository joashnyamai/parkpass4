/**
 * PARKING SPACE CARD COMPONENT - Enhanced
 * Displays parking space information with booking option
 */

import { MapPin, Star, Clock, Navigation, CheckCircle, Heart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ParkingSpaceCard = ({ space, distance, showNavigation = false }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isAvailable = space.status === 'available' && space.availableSpots > 0;
  const features = Array.isArray(space.features) ? space.features : [];
  const availabilityPercentage = space.totalSpots > 0 
    ? Math.round((space.availableSpots / space.totalSpots) * 100) 
    : 0;

  const handleBookNow = () => {
    navigate(`/booking/${space.id}`);
  };

  const handleNavigate = () => {
    if (space.coordinates) {
      const { lat, lng } = space.coordinates;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden card-hover group border border-gray-100">
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden bg-gray-200">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton"></div>
        )}
        <img
          src={space.imageUrl || space.image || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
          alt={space.name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Status Badge */}
        <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm ${
          isAvailable 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'
        }`}>
          {isAvailable ? (
            <span className="flex items-center gap-1">
              <span className="status-dot-success"></span>
              {space.availableSpots} Available
            </span>
          ) : (
            'Full'
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-lg"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`} 
          />
        </button>

        {/* Distance Badge */}
        {distance !== undefined && (
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-sm font-semibold text-gray-900 shadow-lg">
            <Clock className="w-4 h-4 inline mr-1" />
            {distance} km away
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title and Location */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {space.name}
          </h3>
          
          <div className="flex items-start text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" />
            <span className="text-sm line-clamp-2">{space.location}</span>
          </div>
        </div>

        {/* Rating and Price */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-gray-900">
              {space.rating || 4.5}
            </span>
            <span className="text-sm text-gray-500">
              ({space.totalReviews || 0})
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              KES {space.price}
            </div>
            <div className="text-xs text-gray-500">per hour</div>
          </div>
        </div>

        {/* Availability Bar */}
        {space.totalSpots > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Availability</span>
              <span className="font-semibold">{availabilityPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  availabilityPercentage > 50 ? 'bg-green-500' :
                  availabilityPercentage > 20 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${availabilityPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {feature}
                </span>
              ))}
              {features.length > 3 && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                  +{features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleBookNow}
            disabled={!isAvailable}
            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
              isAvailable
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Zap className="w-5 h-5" />
            {isAvailable ? 'Book Now' : 'Unavailable'}
          </button>
          
          {showNavigation && space.coordinates && (
            <button
              onClick={handleNavigate}
              className="p-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 shadow-sm hover:shadow-md"
              title="Get Directions"
            >
              <Navigation className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingSpaceCard;
