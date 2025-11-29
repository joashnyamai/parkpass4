/**
 * RECOMMENDATION ENGINE MODULE
 * Provides intelligent parking space recommendations based on:
 * - User's current location
 * - Distance calculation using Haversine formula
 * - Availability
 * - Price
 * - Rating
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 * 
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate distances for all parking spaces from user location
 * 
 * @param {Array} parkingSpaces - Array of parking space objects
 * @param {Object} userLocation - User's current location {lat, lng}
 * @returns {Array} Parking spaces with distance property added
 */
export const calculateDistances = (parkingSpaces, userLocation) => {
  if (!userLocation || !userLocation.lat || !userLocation.lng) {
    return parkingSpaces.map(space => ({
      ...space,
      distance: 0
    }));
  }
  
  return parkingSpaces.map(space => {
    const spaceCoords = space.coordinates || { lat: 0, lng: 0 };
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      spaceCoords.lat,
      spaceCoords.lng
    );
    
    return {
      ...space,
      distance
    };
  });
};

/**
 * Get recommended parking spaces based on multiple factors
 * 
 * @param {Array} parkingSpaces - Array of parking space objects
 * @param {Object} userLocation - User's current location {lat, lng}
 * @param {Object} preferences - User preferences {maxDistance, maxPrice, sortBy}
 * @returns {Array} Sorted and filtered parking spaces
 */
export const getRecommendedSpaces = (parkingSpaces, userLocation, preferences = {}) => {
  const {
    maxDistance = 10, // km
    maxPrice = Infinity,
    sortBy = 'distance' // 'distance', 'price', 'rating'
  } = preferences;
  
  // Calculate distances
  let spacesWithDistance = calculateDistances(parkingSpaces, userLocation);
  
  // Filter by availability (support both field names)
  spacesWithDistance = spacesWithDistance.filter(space => {
    const availableSpots = space.availableSpots || space.available || 0;
    return space.status === 'available' && availableSpots > 0;
  });
  
  // Filter by max distance
  spacesWithDistance = spacesWithDistance.filter(space => 
    space.distance <= maxDistance
  );
  
  // Filter by max price
  spacesWithDistance = spacesWithDistance.filter(space => 
    space.price <= maxPrice
  );
  
  // Sort based on preference
  spacesWithDistance.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'distance':
      default:
        return a.distance - b.distance;
    }
  });
  
  return spacesWithDistance;
};

/**
 * Get nearest available parking space
 * 
 * @param {Array} parkingSpaces - Array of parking space objects
 * @param {Object} userLocation - User's current location {lat, lng}
 * @returns {Object|null} Nearest parking space or null if none available
 */
export const getNearestParkingSpace = (parkingSpaces, userLocation) => {
  const recommended = getRecommendedSpaces(parkingSpaces, userLocation, {
    sortBy: 'distance'
  });
  
  return recommended.length > 0 ? recommended[0] : null;
};

/**
 * Calculate recommendation score for a parking space
 * Score based on: distance (40%), price (30%), rating (20%), availability (10%)
 * 
 * @param {Object} space - Parking space object
 * @param {number} distance - Distance in km
 * @param {number} maxDistance - Maximum distance to consider
 * @param {number} maxPrice - Maximum price to consider
 * @returns {number} Score between 0-100
 */
export const calculateRecommendationScore = (space, distance, maxDistance = 10, maxPrice = 1000) => {
  // Distance score (closer is better)
  const distanceScore = Math.max(0, (1 - distance / maxDistance) * 40);
  
  // Price score (cheaper is better)
  const priceScore = Math.max(0, (1 - space.price / maxPrice) * 30);
  
  // Rating score
  const ratingScore = ((space.rating || 0) / 5) * 20;
  
  // Availability score
  const availabilityScore = Math.min(space.availableSpots / space.totalSpots, 1) * 10;
  
  return Math.round(distanceScore + priceScore + ratingScore + availabilityScore);
};

/**
 * Get user's current location using browser geolocation API
 * 
 * @returns {Promise<Object>} User location {lat, lng}
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error(`Failed to get location: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};
