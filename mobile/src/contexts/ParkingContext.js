import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { watchParkingSpaces } from '../services/parkingService';

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
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    
    const unsubscribe = watchParkingSpaces((spaces) => {
      setParkingSpaces(spaces);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          lat: location.coords.latitude,
          lng: location.coords.longitude
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const value = {
    parkingSpaces,
    userLocation,
    loading,
    locationPermission,
    refreshLocation: requestLocationPermission
  };

  return (
    <ParkingContext.Provider value={value}>
      {children}
    </ParkingContext.Provider>
  );
};
