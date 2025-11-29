/**
 * CUSTOM HOOK FOR AI RECOMMENDATIONS
 * Provides AI-powered parking recommendations with real-time updates
 */

import { useState, useEffect } from 'react';
import { getAIRecommendations, getPersonalizedRecommendations } from '../services/aiRecommendationService';
import { useAuth } from '../contexts/AuthContext';

export const useAIRecommendations = (parkingSpaces, userLocation, options = {}) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    maxResults = 3,
    minScore = 50,
    usePersonalization = true
  } = options;

  useEffect(() => {
    const fetchRecommendations = async () => {
      console.log('🤖 AI Hook - Starting fetch:', {
        parkingSpacesCount: parkingSpaces?.length,
        hasUserLocation: !!userLocation,
        user: user?.email
      });

      if (!parkingSpaces || parkingSpaces.length === 0) {
        console.log('🤖 AI Hook - No parking spaces available');
        setRecommendations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let results;
        
        // Use personalized recommendations if user is logged in and enabled
        if (user && usePersonalization) {
          console.log('🤖 AI Hook - Using personalized recommendations');
          results = await getPersonalizedRecommendations(
            user.uid,
            parkingSpaces,
            userLocation
          );
        } else {
          console.log('🤖 AI Hook - Using standard AI recommendations');
          results = await getAIRecommendations(
            parkingSpaces,
            userLocation,
            user?.uid,
            { maxResults, minScore }
          );
        }

        console.log('🤖 AI Hook - Results:', results);
        setRecommendations(results);
      } catch (err) {
        console.error('🤖 AI Hook - Error:', err);
        setError(err.message);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [parkingSpaces, userLocation, user, maxResults, minScore, usePersonalization]);

  console.log('🤖 AI Hook - Current state:', {
    recommendationsCount: recommendations.length,
    loading,
    error
  });

  return {
    recommendations,
    loading,
    error
  };
};
