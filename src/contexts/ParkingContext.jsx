/**
 * PARKING CONTEXT
 * Provides real-time parking data to all components
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { watchParkingSpaces } from '../services/parkingService';
import { getUserLocation } from '../services/recommendationService';

const ParkingContext = createContext();

export const useParkingContext = () => {
  const context = useContext(ParkingContext);
  if (!context) {
    throw new Error('useParkingContext must be used within ParkingProvider');
  }
  return context;
};

export const ParkingProvider = ({ children }) => {
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time parking spaces listener
  useEffect(() => {
    const unsubscribe = watchParkingSpaces((spaces) => {
      setParkingSpaces(spaces);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get user location on mount
  useEffect(() => {
    getUserLocation()
      .then(location => setUserLocation(location))
      .catch(err => console.warn('Could not get user location:', err.message));
  }, []);

  const value = {
    parkingSpaces,
    userLocation,
    loading,
    error,
    setUserLocation
  };

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
};
