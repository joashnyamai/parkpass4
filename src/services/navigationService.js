/**
 * NAVIGATION MODULE
 * Handles Google Maps integration and navigation features
 */

/**
 * Get directions from user location to parking space
 */
export const getDirections = (origin, destination) => {
  if (!window.google) {
    throw new Error('Google Maps not loaded');
  }
  
  return new Promise((resolve, reject) => {
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK') {
          resolve(result);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      }
    );
  });
};

/**
 * Open Google Maps navigation in new tab
 */
export const openGoogleMapsNavigation = (destination) => {
  const { lat, lng } = destination;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
};
