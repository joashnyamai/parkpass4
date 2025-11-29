/**
 * CUSTOM HOOK FOR PARKING RECOMMENDATIONS
 * Uses recommendation engine to suggest best parking spaces
 */

import { useState, useEffect } from 'react';
import { getRecommendedSpaces, getNearestParkingSpace } from '../services/recommendationService';

export const useParkingRecommendations = (parkingSpaces, userLocation, preferences = {}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [nearestSpace, setNearestSpace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parkingSpaces || parkingSpaces.length === 0) {
      setRecommendations([]);
      setNearestSpace(null);
      setLoading(false);
      return;
    }

    try {
      const recommended = getRecommendedSpaces(parkingSpaces, userLocation, preferences);
      setRecommendations(recommended);
      
      const nearest = getNearestParkingSpace(parkingSpaces, userLocation);
      setNearestSpace(nearest);
    } catch (error) {
      console.error('Error calculating recommendations:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkingSpaces, userLocation]);

  return {
    recommendations,
    nearestSpace,
    loading
  };
};
