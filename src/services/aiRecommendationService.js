/**
 * AI-POWERED RECOMMENDATION ENGINE
 * 
 * This service provides intelligent parking recommendations using:
 * 1. Rule-based AI (distance, availability, price, rating)
 * 2. Historical pattern analysis
 * 3. Time-based predictions
 * 4. User preference learning
 */

import { calculateDistance } from './recommendationService';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * SCORING WEIGHTS
 * Adjust these to fine-tune the AI recommendations
 */
const WEIGHTS = {
  distance: 0.35,      // 35% - Proximity is most important
  availability: 0.25,  // 25% - Available spots matter
  price: 0.15,         // 15% - Cost consideration
  rating: 0.15,        // 15% - User ratings
  historical: 0.10     // 10% - Past usage patterns
};

/**
 * TIME-BASED DEMAND PREDICTION
 * Predicts parking demand based on time of day and day of week
 */
const predictDemand = (hour, dayOfWeek) => {
  // Peak hours: 8-10 AM, 12-2 PM, 5-7 PM on weekdays
  const isPeakHour = (
    (hour >= 8 && hour <= 10) ||
    (hour >= 12 && hour <= 14) ||
    (hour >= 17 && hour <= 19)
  );
  
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  if (isWeekday && isPeakHour) return 0.9; // High demand
  if (isWeekday && !isPeakHour) return 0.5; // Medium demand
  if (isWeekend && (hour >= 10 && hour <= 20)) return 0.7; // Weekend demand
  return 0.3; // Low demand
};

/**
 * CALCULATE AI SCORE
 * Multi-factor scoring algorithm
 */
export const calculateAIScore = (space, userLocation, historicalData = null) => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  
  // 1. Distance Score (0-100, closer is better)
  const distance = space.distance || 0;
  const maxDistance = 10; // km
  const distanceScore = Math.max(0, (1 - distance / maxDistance) * 100);
  
  // 2. Availability Score (0-100)
  const availabilityRatio = space.availableSpots / (space.totalSpots || 1);
  const availabilityScore = availabilityRatio * 100;
  
  // 3. Price Score (0-100, cheaper is better)
  const maxPrice = 500; // KES
  const priceScore = Math.max(0, (1 - space.price / maxPrice) * 100);
  
  // 4. Rating Score (0-100)
  const ratingScore = ((space.rating || 0) / 5) * 100;
  
  // 5. Historical Score (0-100)
  let historicalScore = 50; // Default neutral score
  if (historicalData && historicalData[space.id]) {
    const bookingCount = historicalData[space.id].count || 0;
    const successRate = historicalData[space.id].successRate || 0.5;
    historicalScore = (bookingCount * 10 + successRate * 100) / 2;
    historicalScore = Math.min(100, historicalScore);
  }
  
  // 6. Time-based demand adjustment
  const demandFactor = predictDemand(hour, dayOfWeek);
  const demandAdjustment = (1 - demandFactor) * 20; // Boost score for low-demand times
  
  // Calculate weighted score
  const weightedScore = 
    (distanceScore * WEIGHTS.distance) +
    (availabilityScore * WEIGHTS.availability) +
    (priceScore * WEIGHTS.price) +
    (ratingScore * WEIGHTS.rating) +
    (historicalScore * WEIGHTS.historical) +
    demandAdjustment;
  
  return {
    totalScore: Math.round(weightedScore),
    breakdown: {
      distance: Math.round(distanceScore),
      availability: Math.round(availabilityScore),
      price: Math.round(priceScore),
      rating: Math.round(ratingScore),
      historical: Math.round(historicalScore),
      demandAdjustment: Math.round(demandAdjustment)
    },
    confidence: calculateConfidence(space, distance, availabilityRatio),
    demandLevel: demandFactor > 0.7 ? 'high' : demandFactor > 0.4 ? 'medium' : 'low'
  };
};

/**
 * CALCULATE CONFIDENCE LEVEL
 * How confident is the AI in this recommendation?
 */
const calculateConfidence = (space, distance, availabilityRatio) => {
  let confidence = 0.5; // Start at 50%
  
  // Boost confidence for nearby spaces
  if (distance < 1) confidence += 0.2;
  else if (distance < 3) confidence += 0.1;
  
  // Boost confidence for high availability
  if (availabilityRatio > 0.5) confidence += 0.15;
  else if (availabilityRatio > 0.3) confidence += 0.1;
  
  // Boost confidence for highly rated spaces
  if (space.rating >= 4.5) confidence += 0.1;
  else if (space.rating >= 4.0) confidence += 0.05;
  
  // Boost confidence for spaces with many reviews
  if (space.totalReviews > 50) confidence += 0.05;
  
  return Math.min(1, confidence);
};

/**
 * GET HISTORICAL PATTERNS
 * Analyze past booking data for pattern recognition
 */
export const getHistoricalPatterns = async (userId = null) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    let q = query(
      collection(db, 'ParkingHistory'),
      where('createdAt', '>=', thirtyDaysAgo),
      orderBy('createdAt', 'desc'),
      limit(1000)
    );
    
    // If user ID provided, get user-specific patterns
    if (userId) {
      q = query(
        collection(db, 'ParkingHistory'),
        where('userId', '==', userId),
        where('createdAt', '>=', thirtyDaysAgo),
        orderBy('createdAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    const patterns = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const spaceId = data.parkingSpaceId;
      
      if (!patterns[spaceId]) {
        patterns[spaceId] = {
          count: 0,
          successfulBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          peakHours: {}
        };
      }
      
      patterns[spaceId].count++;
      
      if (data.status === 'completed') {
        patterns[spaceId].successfulBookings++;
      }
      
      if (data.totalPrice) {
        patterns[spaceId].totalRevenue += data.totalPrice;
      }
      
      // Track peak hours
      if (data.startTime) {
        const hour = new Date(data.startTime.toDate()).getHours();
        patterns[spaceId].peakHours[hour] = (patterns[spaceId].peakHours[hour] || 0) + 1;
      }
    });
    
    // Calculate success rates
    Object.keys(patterns).forEach(spaceId => {
      const pattern = patterns[spaceId];
      pattern.successRate = pattern.successfulBookings / pattern.count;
      pattern.averageRevenue = pattern.totalRevenue / pattern.count;
    });
    
    return patterns;
  } catch (error) {
    console.error('Error fetching historical patterns:', error);
    return {};
  }
};

/**
 * GET AI RECOMMENDATIONS
 * Main function to get AI-powered parking recommendations
 */
export const getAIRecommendations = async (parkingSpaces, userLocation, userId = null, options = {}) => {
  const {
    maxResults = 3,
    minScore = 50,
    includeHistorical = true
  } = options;
  
  // Get historical patterns if enabled
  let historicalData = {};
  if (includeHistorical) {
    historicalData = await getHistoricalPatterns(userId);
  }
  
  // Calculate AI scores for all spaces
  const scoredSpaces = parkingSpaces
    .filter(space => space.status === 'available' && space.availableSpots > 0)
    .map(space => {
      // Calculate distance if not already present
      if (!space.distance && userLocation) {
        const coords = space.coordinates || { lat: 0, lng: 0 };
        space.distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          coords.lat,
          coords.lng
        );
      }
      
      const aiScore = calculateAIScore(space, userLocation, historicalData);
      
      return {
        ...space,
        aiScore: aiScore.totalScore,
        scoreBreakdown: aiScore.breakdown,
        confidence: aiScore.confidence,
        demandLevel: aiScore.demandLevel,
        recommendation: getRecommendationLabel(aiScore.totalScore, aiScore.confidence)
      };
    })
    .filter(space => space.aiScore >= minScore)
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, maxResults);
  
  return scoredSpaces;
};

/**
 * GET RECOMMENDATION LABEL
 * Human-readable recommendation label
 */
const getRecommendationLabel = (score, confidence) => {
  if (score >= 85 && confidence >= 0.8) return 'Best Choice';
  if (score >= 75 && confidence >= 0.7) return 'Excellent Option';
  if (score >= 65) return 'Great Choice';
  if (score >= 55) return 'Good Option';
  return 'Available';
};

/**
 * PREDICT AVAILABILITY
 * Predict if a parking space will be available at a future time
 */
export const predictAvailability = async (spaceId, targetTime) => {
  try {
    // Get historical bookings for this space
    const q = query(
      collection(db, 'ParkingHistory'),
      where('parkingSpaceId', '==', spaceId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map(doc => doc.data());
    
    const targetHour = new Date(targetTime).getHours();
    const targetDay = new Date(targetTime).getDay();
    
    // Count bookings at similar times
    let similarTimeBookings = 0;
    let totalSimilarSlots = 0;
    
    bookings.forEach(booking => {
      if (booking.startTime) {
        const bookingTime = booking.startTime.toDate();
        const bookingHour = bookingTime.getHours();
        const bookingDay = bookingTime.getDay();
        
        // Check if similar time (same hour, same day of week)
        if (Math.abs(bookingHour - targetHour) <= 1 && bookingDay === targetDay) {
          similarTimeBookings++;
        }
        totalSimilarSlots++;
      }
    });
    
    // Calculate probability
    const occupancyRate = totalSimilarSlots > 0 ? similarTimeBookings / totalSimilarSlots : 0.5;
    const availabilityProbability = 1 - occupancyRate;
    
    return {
      probability: availabilityProbability,
      confidence: totalSimilarSlots > 10 ? 'high' : totalSimilarSlots > 5 ? 'medium' : 'low',
      historicalData: {
        totalBookings: totalSimilarSlots,
        similarTimeBookings
      }
    };
  } catch (error) {
    console.error('Error predicting availability:', error);
    return {
      probability: 0.5,
      confidence: 'low',
      historicalData: null
    };
  }
};

/**
 * GET PERSONALIZED RECOMMENDATIONS
 * Learn from user's past behavior
 */
export const getPersonalizedRecommendations = async (userId, parkingSpaces, userLocation) => {
  try {
    // Get user's booking history
    const q = query(
      collection(db, 'ParkingHistory'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    const userBookings = snapshot.docs.map(doc => doc.data());
    
    // Analyze user preferences
    const preferences = {
      averagePrice: 0,
      preferredLocations: {},
      preferredFeatures: {},
      averageDistance: 0,
      bookingTimes: []
    };
    
    userBookings.forEach(booking => {
      if (booking.totalPrice) {
        preferences.averagePrice += booking.totalPrice;
      }
      
      if (booking.parkingSpaceId) {
        preferences.preferredLocations[booking.parkingSpaceId] = 
          (preferences.preferredLocations[booking.parkingSpaceId] || 0) + 1;
      }
      
      if (booking.startTime) {
        preferences.bookingTimes.push(booking.startTime.toDate().getHours());
      }
    });
    
    if (userBookings.length > 0) {
      preferences.averagePrice /= userBookings.length;
    }
    
    // Boost scores for spaces matching user preferences
    const personalizedSpaces = parkingSpaces.map(space => {
      let personalizedBoost = 0;
      
      // Boost frequently used spaces
      if (preferences.preferredLocations[space.id]) {
        personalizedBoost += preferences.preferredLocations[space.id] * 10;
      }
      
      // Boost spaces within user's price range
      if (Math.abs(space.price - preferences.averagePrice) < 50) {
        personalizedBoost += 15;
      }
      
      return {
        ...space,
        personalizedBoost
      };
    });
    
    return getAIRecommendations(personalizedSpaces, userLocation, userId);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return getAIRecommendations(parkingSpaces, userLocation, userId);
  }
};
