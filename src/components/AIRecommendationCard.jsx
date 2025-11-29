/**
 * AI RECOMMENDATION CARD COMPONENT
 * Displays parking space with AI score, confidence, and recommendation label
 */

import React from 'react';
import { MapPin, Star, Clock, Navigation, TrendingUp, Zap, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AIRecommendationCard = ({ space, showAIDetails = true, rank = null }) => {
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

  // Get badge color based on recommendation
  const getBadgeColor = (recommendation) => {
    switch (recommendation) {
      case 'Best Choice':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'Excellent Option':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      case 'Great Choice':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get confidence indicator
  const getConfidenceIndicator = (confidence) => {
    const percentage = Math.round(confidence * 100);
    if (percentage >= 80) return { text: 'High Confidence', color: 'text-green-600' };
    if (percentage >= 60) return { text: 'Medium Confidence', color: 'text-yellow-600' };
    return { text: 'Low Confidence', color: 'text-gray-600' };
  };

  const confidenceInfo = space.confidence ? getConfidenceIndicator(space.confidence) : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500">
      {/* Rank Badge */}
      {rank && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
            {rank}
          </div>
        </div>
      )}

      <div className="relative">
        <img
          src={space.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
          alt={space.name}
          className="w-full h-48 object-cover"
        />
        
        {/* AI Recommendation Badge */}
        {showAIDetails && space.recommendation && (
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${getBadgeColor(space.recommendation)}`}>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4" />
              {space.recommendation}
            </div>
          </div>
        )}

        {/* Availability Badge */}
        <div className={`absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
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

        {/* AI Score Section */}
        {showAIDetails && space.aiScore !== undefined && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">AI Score</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {space.aiScore}/100
              </div>
            </div>
            
            {/* Confidence Indicator */}
            {confidenceInfo && (
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${confidenceInfo.color}`}>
                  {confidenceInfo.text}
                </span>
                <span className="text-gray-500">
                  {Math.round(space.confidence * 100)}% match
                </span>
              </div>
            )}

            {/* Demand Level */}
            {space.demandLevel && (
              <div className="mt-2 text-xs">
                <span className="text-gray-600">Demand: </span>
                <span className={`font-medium ${
                  space.demandLevel === 'high' ? 'text-red-600' :
                  space.demandLevel === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {space.demandLevel.charAt(0).toUpperCase() + space.demandLevel.slice(1)}
                </span>
              </div>
            )}
          </div>
        )}

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

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  <Award className="w-3 h-3 mr-1" />
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

        {space.distance !== undefined && (
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Clock className="w-4 h-4 mr-1" />
            {space.distance} km away
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleBookNow}
            disabled={!isAvailable}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isAvailable ? 'Book Now' : 'Unavailable'}
          </button>
          
          {space.coordinates && (
            <button
              onClick={handleNavigate}
              className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors shadow-md"
            >
              <Navigation className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Score Breakdown (Expandable) */}
        {showAIDetails && space.scoreBreakdown && (
          <details className="mt-4">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 font-medium">
              View Score Breakdown
            </summary>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Distance:</span>
                <span className="font-medium">{space.scoreBreakdown.distance}/100</span>
              </div>
              <div className="flex justify-between">
                <span>Availability:</span>
                <span className="font-medium">{space.scoreBreakdown.availability}/100</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">{space.scoreBreakdown.price}/100</span>
              </div>
              <div className="flex justify-between">
                <span>Rating:</span>
                <span className="font-medium">{space.scoreBreakdown.rating}/100</span>
              </div>
              {space.scoreBreakdown.historical !== undefined && (
                <div className="flex justify-between">
                  <span>Historical:</span>
                  <span className="font-medium">{space.scoreBreakdown.historical}/100</span>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

export default AIRecommendationCard;
