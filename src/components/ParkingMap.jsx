/**
 * PARKING MAP COMPONENT
 * Displays parking spaces on Mapbox with real-time updates
 */

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const ParkingMap = ({ parkingSpaces = [], userLocation, onSpaceSelect, selectedSpace }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [userMarker, setUserMarker] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);

  // Initialize Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      const apiKey = import.meta.env.VITE_MAPS_API_KEY;
      
      console.log('🗺️ Loading Google Maps...');
      console.log('API Key present:', !!apiKey);
      
      if (!apiKey) {
        console.error('❌ Google Maps API key not found in environment variables');
        return;
      }

      if (window.google) {
        console.log('✅ Google Maps already loaded');
        initMap();
        return;
      }

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('⏳ Google Maps script already loading...');
        existingScript.addEventListener('load', initMap);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google Maps loaded successfully');
        setMapLoading(false);
        initMap();
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Google Maps:', error);
        setMapError('Failed to load Google Maps. Please check your API key.');
        setMapLoading(false);
      };
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!window.google) {
        console.error('❌ Google Maps not available');
        return;
      }

      if (!mapRef.current) {
        console.error('❌ Map container ref not available');
        return;
      }

      console.log('🗺️ Initializing map...');
      const center = userLocation || { lat: -1.286389, lng: 36.817223 }; // Nairobi default
      
      const mapOptions = {
        center,
        zoom: 14,
        mapTypeId: 'hybrid', // Aerial/satellite view with labels
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: window.google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain']
        },
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER
        }
      };

      try {
        const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
        console.log('✅ Map initialized successfully');
        setMap(newMap);
        setMapLoading(false);
        setMapError(null);
      } catch (error) {
        console.error('❌ Error initializing map:', error);
        setMapError(`Error initializing map: ${error.message}`);
        setMapLoading(false);
      }
    };

    loadGoogleMaps();

    return () => {
      markers.forEach(marker => marker.setMap(null));
      if (userMarker) userMarker.setMap(null);
    };
  }, []);

  // Add user location marker
  useEffect(() => {
    if (map && userLocation) {
      if (userMarker) {
        userMarker.setPosition(userLocation);
      } else {
        const marker = new window.google.maps.Marker({
          position: userLocation,
          map,
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
        setUserMarker(marker);
      }
      map.setCenter(userLocation);
    }
  }, [map, userLocation]);

  // Add parking space markers
  useEffect(() => {
    if (!map || !window.google) return;

    console.log('📍 Adding markers for', parkingSpaces.length, 'parking spaces');
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = parkingSpaces.map((space) => {
      const position = space.coordinates || { lat: -1.286389, lng: 36.817223 };
      console.log(`📌 ${space.name}:`, position);
      
      const isSelected = selectedSpace?.id === space.id;
      const isAvailable = space.status === 'available' && space.availableSpots > 0;
      
      const availableSpots = space.availableSpots || space.available || 0;
      const totalSpots = space.totalSpots || space.total || 0;
      
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: space.name,
        animation: isSelected ? window.google.maps.Animation.BOUNCE : null,
        icon: {
          url: `data:image/svg+xml;base64,${btoa(`
            <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
              <!-- Pin shape -->
              <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 35 15 35s15-26.716 15-35c0-8.284-6.716-15-15-15z" 
                    fill="${isAvailable ? '#10B981' : '#EF4444'}" 
                    stroke="white" 
                    stroke-width="2"/>
              ${isSelected ? '<circle cx="20" cy="15" r="8" fill="white" opacity="0.3"/>' : ''}
              <!-- P icon -->
              <text x="20" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">P</text>
              <!-- Available spots badge -->
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

      // Info window with enhanced content
      const features = Array.isArray(space.features) ? space.features.slice(0, 3).join(', ') : '';
      
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #1F2937;">${space.name}</h3>
            <p style="margin: 4px 0; font-size: 14px; color: #6B7280; display: flex; align-items: center;">
              📍 ${space.location}
            </p>
            <div style="margin: 8px 0; padding: 8px; background: ${isAvailable ? '#ECFDF5' : '#FEE2E2'}; border-radius: 6px;">
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${isAvailable ? '#10B981' : '#EF4444'};">
                ${isAvailable ? `✅ ${availableSpots} spots available` : '❌ No spots available'}
              </p>
            </div>
            <p style="margin: 8px 0; font-size: 16px; font-weight: bold; color: #2563EB;">
              💰 KES ${space.price}/hour
            </p>
            ${features ? `<p style="margin: 4px 0; font-size: 12px; color: #6B7280;">🎯 ${features}</p>` : ''}
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
                  transition: background 0.2s;
                "
                onmouseover="this.style.background='#1D4ED8'"
                onmouseout="this.style.background='#2563EB'"
              >
                Book Now →
              </button>
            ` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close all other info windows
        markers.forEach(m => {
          if (m.infoWindow) m.infoWindow.close();
        });
        
        infoWindow.open(map, marker);
        marker.infoWindow = infoWindow;
        
        if (onSpaceSelect) {
          onSpaceSelect(space);
        }
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      if (userLocation) bounds.extend(userLocation);
      map.fitBounds(bounds);
    }
  }, [map, parkingSpaces, selectedSpace]);

  return (
    <div className="w-full h-full rounded-lg relative" style={{ minHeight: '600px' }}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '600px', width: '100%' }}
      />
      
      {/* Map Legend */}
      {map && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
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
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-600">Live Updates</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Parking Count Badge */}
      {map && parkingSpaces.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🅿️</span>
            <div>
              <p className="text-xs text-gray-600">Total Parking Spaces</p>
              <p className="text-lg font-bold text-gray-900">{parkingSpaces.length}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {mapLoading && !map && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-20">
          <div className="text-center text-gray-600">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Loading Map...</h3>
            <p className="text-sm">Initializing Google Maps</p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg z-20">
          <div className="text-center text-red-600 max-w-md p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Map Loading Failed</h3>
            <p className="text-sm mb-4">{mapError}</p>
            <div className="text-xs text-left bg-white p-4 rounded border border-red-200">
              <p className="font-semibold mb-2">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your Google Maps API key</li>
                <li>Ensure Maps JavaScript API is enabled</li>
                <li>Check browser console for errors</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMap;
