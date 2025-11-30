/**
 * SIMPLE PARKING MAP - Google Maps Fallback
 * Lightweight alternative if Mapbox fails
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ParkingMapSimple = ({ parkingSpaces = [], userLocation, onSpaceSelect, selectedSpace }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGoogleMaps = () => {
      const apiKey = import.meta.env.VITE_MAPS_API_KEY;
      
      console.log('🗺️ Loading Google Maps...');
      
      if (!apiKey) {
        setMapError('Google Maps API key not found');
        return;
      }

      if (window.google?.maps) {
        console.log('✅ Google Maps already loaded');
        initMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google Maps loaded');
        initMap();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps');
        setMapError('Failed to load Google Maps');
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!window.google?.maps || !mapRef.current) {
        console.error('❌ Google Maps or container not available');
        return;
      }

      try {
        const center = userLocation || { lat: -1.286389, lng: 36.817223 };
        
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 13,
          mapTypeId: 'roadmap',
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
        setMapError(null);
        console.log('✅ Google Maps initialized');
      } catch (error) {
        console.error('❌ Error initializing map:', error);
        setMapError(error.message);
      }
    };

    loadGoogleMaps();

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  // Add user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !userLocation || !window.google) return;

    new window.google.maps.Marker({
      position: userLocation,
      map: mapInstanceRef.current,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    });

    mapInstanceRef.current.setCenter(userLocation);
  }, [mapLoaded, userLocation]);

  // Add parking markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    parkingSpaces.forEach((space) => {
      const position = space.coordinates || { lat: -1.286389, lng: 36.817223 };
      const isAvailable = space.status === 'available' && space.availableSpots > 0;
      const availableSpots = space.availableSpots || 0;

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: space.name,
        icon: {
          url: `data:image/svg+xml;base64,${btoa(`
            <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 35 15 35s15-26.716 15-35c0-8.284-6.716-15-15-15z" 
                    fill="${isAvailable ? '#10B981' : '#EF4444'}" 
                    stroke="white" 
                    stroke-width="2"/>
              <text x="20" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">P</text>
              ${isAvailable ? `
                <circle cx="32" cy="8" r="8" fill="white" stroke="${isAvailable ? '#10B981' : '#EF4444'}" stroke-width="2"/>
                <text x="32" y="12" text-anchor="middle" fill="${isAvailable ? '#10B981' : '#EF4444'}" font-size="10" font-weight="bold">${availableSpots}</text>
              ` : ''}
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(40, 50),
          anchor: new window.google.maps.Point(20, 50)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold;">${space.name}</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #666;">📍 ${space.location}</p>
            <div style="margin: 8px 0; padding: 8px; background: ${isAvailable ? '#ECFDF5' : '#FEE2E2'}; border-radius: 6px;">
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${isAvailable ? '#10B981' : '#EF4444'};">
                ${isAvailable ? `✅ ${availableSpots} spots available` : '❌ No spots available'}
              </p>
            </div>
            <p style="margin: 8px 0; font-size: 16px; font-weight: bold; color: #2563EB;">💰 KES ${space.price}/hour</p>
            ${isAvailable ? `
              <button 
                onclick="window.location.href='/booking/${space.id}'"
                style="
                  margin-top: 12px;
                  width: 100%;
                  padding: 10px;
                  background: #2563EB;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-size: 14px;
                  font-weight: 600;
                  cursor: pointer;
                "
              >
                Book Now →
              </button>
            ` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        markersRef.current.forEach(m => {
          if (m.infoWindow) m.infoWindow.close();
        });
        infoWindow.open(mapInstanceRef.current, marker);
        marker.infoWindow = infoWindow;
        if (onSpaceSelect) onSpaceSelect(space);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    if (parkingSpaces.length > 0) {
      if (userLocation) bounds.extend(userLocation);
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [mapLoaded, parkingSpaces, onSpaceSelect]);

  return (
    <div className="w-full h-full rounded-lg relative bg-gray-100" style={{ minHeight: '600px', height: '100%' }}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ 
          minHeight: '600px',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />

      {/* Legend */}
      {mapLoaded && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-700">Full</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-700">Your Location</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Map...</h3>
            <p className="text-sm text-gray-600">Initializing Google Maps</p>
          </div>
        </div>
      )}

      {/* Error */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg z-20">
          <div className="text-center max-w-md p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Map Loading Failed</h3>
            <p className="text-sm text-red-700 mb-4">{mapError}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMapSimple;
