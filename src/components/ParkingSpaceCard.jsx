/**
 * PARKING SPACE CARD COMPONENT
 * Displays parking space information with booking option
 */

import React from 'react';
import { MapPin, Star, Clock, Navigation, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ParkingSpaceCard = ({ space, distance, showNavigation = false }) => {
  const navigate = useNavigate();

  const isAvailable = space.status === 'available' && space.availableSpots > 0;
  const features = Array.isArray(space.features) ? space.features : [];

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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={space.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
          alt={space.name}
          className="w-full h-48 object-cover"
        />
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${
          isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isAvailable ? `${space.availableSpots} Available` : 'Full'}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{space.name}</h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{space.location}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-sm text-gray-600">
              {space.rating || 0} ({space.totalReviews || 0} reviews)
            </span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            KES {space.price}/hour
          </div>
        </div>

        {features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {feature}
                </span>
              ))}
              {features.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {distance !== undefined && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Clock className="w-4 h-4 mr-1" />
            {distance} km away
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleBookNow}
            disabled={!isAvailable}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAvailable ? 'Book Now' : 'Unavailable'}
          </button>
          
          {showNavigation && space.coordinates && (
            <button
              onClick={handleNavigate}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Navigation className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingSpaceCard;
