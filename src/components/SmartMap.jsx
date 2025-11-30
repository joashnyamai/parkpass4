/**
 * SMART MAP WRAPPER
 * Tries Mapbox first, falls back to Google Maps if needed
 */

import { useState, useEffect } from 'react';
import ParkingMapbox from './ParkingMapbox';
import ParkingMapSimple from './ParkingMapSimpleFixed';

const SmartMap = ({ parkingSpaces, userLocation, onSpaceSelect, selectedSpace }) => {
  const [useMapbox, setUseMapbox] = useState(true);
  const [mapboxFailed, setMapboxFailed] = useState(false);

  useEffect(() => {
    // Check if Mapbox token exists
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.warn('⚠️ No Mapbox token found, using Google Maps');
      setUseMapbox(false);
    }
  }, []);

  // If Mapbox fails, switch to Google Maps
  const handleMapboxError = () => {
    console.warn('⚠️ Mapbox failed, switching to Google Maps');
    setMapboxFailed(true);
    setUseMapbox(false);
  };

  if (!useMapbox || mapboxFailed) {
    return (
      <ParkingMapSimple
        parkingSpaces={parkingSpaces}
        userLocation={userLocation}
        onSpaceSelect={onSpaceSelect}
        selectedSpace={selectedSpace}
      />
    );
  }

  return (
    <ParkingMapbox
      parkingSpaces={parkingSpaces}
      userLocation={userLocation}
      onSpaceSelect={onSpaceSelect}
      selectedSpace={selectedSpace}
      onError={handleMapboxError}
    />
  );
};

export default SmartMap;
