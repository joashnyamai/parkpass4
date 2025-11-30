/**
 * PARKING MAP COMPONENT - MAPBOX (Enhanced)
 * Displays parking spaces on Mapbox with real-time updates
 */

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './mapbox-styles.css';
import { useNavigate } from 'react-router-dom';

const ParkingMapbox = ({ parkingSpaces = [], userLocation, onSpaceSelect, selectedSpace }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const navigate = useNavigate();

  // Initialize Mapbox
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    
    console.log('🗺️ Initializing Mapbox...');
    console.log('Token present:', !!token);
    console.log('Container ref:', mapContainerRef.current);
    
    if (!token) {
      const error = 'Mapbox token not found. Please add VITE_MAPBOX_TOKEN to your .env file';
      console.error('❌', error);
      setMapError(error);
      return;
    }

    if (!mapContainerRef.current) {
      console.error('❌ Map container ref not available');
      setMapError('Map container not ready');
      return;
    }

    try {
      mapboxgl.accessToken = token;
      console.log('✅ Mapbox token set');

      const center = userLocation 
        ? [userLocation.lng, userLocation.lat]
        : [36.817223, -1.286389]; // Nairobi default

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: 13,
        pitch: 0,
        bearing: 0,
        antialias: true,
        preserveDrawingBuffer: false
      });

      console.log('✅ Mapbox instance created');

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add style switcher
    const styleControl = document.createElement('div');
    styleControl.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    styleControl.innerHTML = `
      <button id="satellite-btn" title="Satellite View" style="padding: 8px;">🛰️</button>
      <button id="streets-btn" title="Streets View" style="padding: 8px;">🗺️</button>
    `;
    map.addControl({
      onAdd: () => styleControl,
      onRemove: () => {}
    }, 'top-right');

      map.on('load', () => {
        console.log('✅ Mapbox map loaded successfully');
        setMapLoaded(true);
        setMapError(null);

        // Style switcher handlers
        setTimeout(() => {
          document.getElementById('satellite-btn')?.addEventListener('click', () => {
            map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
          });
          document.getElementById('streets-btn')?.addEventListener('click', () => {
            map.setStyle('mapbox://styles/mapbox/streets-v12');
          });
        }, 100);
      });

      map.on('error', (e) => {
        console.error('❌ Mapbox error:', e);
        setMapError(e.error?.message || 'Map loading error');
      });

      // Handle WebGL context loss
      const canvas = map.getCanvas();
      if (canvas) {
        canvas.addEventListener('webglcontextlost', (e) => {
          console.warn('⚠️ WebGL context lost, preventing default');
          e.preventDefault();
        });

        canvas.addEventListener('webglcontextrestored', () => {
          console.log('✅ WebGL context restored');
          setMapLoaded(true);
        });
      }

      mapRef.current = map;

      return () => {
        if (map) {
          map.remove();
          console.log('🗑️ Mapbox instance removed');
        }
      };
    } catch (error) {
      console.error('❌ Error initializing Mapbox:', error);
      setMapError(error.message || 'Failed to initialize map');
    }
  }, []);

  // Add user location marker
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !userLocation) return;

    // Validate user location coordinates
    if (!userLocation.lat || !userLocation.lng || 
        isNaN(userLocation.lat) || isNaN(userLocation.lng)) {
      console.warn('⚠️ Invalid user location coordinates:', userLocation);
      return;
    }

    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.cssText = `
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4285F4;
      border: 3px solid white;
      box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
    `;

    new mapboxgl.Marker(el)
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Location</strong>'))
      .addTo(mapRef.current);

    mapRef.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 13
    });
  }, [mapLoaded, userLocation]);

  // Add parking space markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    console.log('📍 Adding', parkingSpaces.length, 'parking markers');

    const bounds = new mapboxgl.LngLatBounds();

    parkingSpaces.forEach((space) => {
      const coords = space.coordinates || { lat: -1.286389, lng: 36.817223 };
      
      // Validate coordinates
      if (!coords.lat || !coords.lng || isNaN(coords.lat) || isNaN(coords.lng)) {
        console.warn(`⚠️ Invalid coordinates for ${space.name}:`, coords);
        return; // Skip this space
      }

      const availableSpots = space.availableSpots || space.available || 0;
      const isAvailable = space.status === 'available' && availableSpots > 0;

      // Create custom marker
      const el = document.createElement('div');
      el.className = 'parking-marker';
      el.style.cssText = `
        width: 40px;
        height: 50px;
        background-image: url('data:image/svg+xml;base64,${btoa(`
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
        `)}');
        background-size: contain;
        cursor: pointer;
        transition: transform 0.2s;
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create popup
      const features = Array.isArray(space.features) ? space.features.slice(0, 3).join(', ') : '';
      const popupHTML = `
        <div style="padding: 12px; min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #1F2937;">${space.name}</h3>
          <p style="margin: 4px 0; font-size: 14px; color: #6B7280;">📍 ${space.location}</p>
          <div style="margin: 8px 0; padding: 8px; background: ${isAvailable ? '#ECFDF5' : '#FEE2E2'}; border-radius: 6px;">
            <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${isAvailable ? '#10B981' : '#EF4444'};">
              ${isAvailable ? `✅ ${availableSpots} spots available` : '❌ No spots available'}
            </p>
          </div>
          <p style="margin: 8px 0; font-size: 16px; font-weight: bold; color: #2563EB;">💰 KES ${space.price}/hour</p>
          ${features ? `<p style="margin: 4px 0; font-size: 12px; color: #6B7280;">🎯 ${features}</p>` : ''}
          ${isAvailable ? `
            <button 
              id="book-btn-${space.id}"
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
      `;

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupHTML)
        .on('open', () => {
          const bookBtn = document.getElementById(`book-btn-${space.id}`);
          if (bookBtn) {
            bookBtn.addEventListener('click', () => {
              navigate(`/booking/${space.id}`);
            });
          }
          if (onSpaceSelect) {
            onSpaceSelect(space);
          }
        });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([coords.lng, coords.lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
      
      // Only extend bounds if coordinates are valid
      if (coords.lng && coords.lat && !isNaN(coords.lng) && !isNaN(coords.lat)) {
        bounds.extend([coords.lng, coords.lat]);
      }
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      if (userLocation && userLocation.lng && userLocation.lat && 
          !isNaN(userLocation.lng) && !isNaN(userLocation.lat)) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      
      try {
        mapRef.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
      } catch (error) {
        console.warn('⚠️ Could not fit bounds:', error);
        // Fallback to default center
        mapRef.current.setCenter([36.817223, -1.286389]);
        mapRef.current.setZoom(13);
      }
    }
  }, [mapLoaded, parkingSpaces, selectedSpace, onSpaceSelect, navigate]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      minHeight: '600px',
      position: 'relative',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      backgroundColor: '#f3f4f6'
    }}>
      <div 
        ref={mapContainerRef}
        className="map-container"
        style={{ 
          width: '100%',
          height: '100%',
          minHeight: '600px',
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
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-600">Live Updates</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Parking Count */}
      {mapLoaded && parkingSpaces.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🅿️</span>
            <div>
              <p className="text-xs text-gray-600">Total Parking</p>
              <p className="text-lg font-bold text-gray-900">{parkingSpaces.length}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Map...</h3>
            <p className="text-sm text-gray-600">Initializing Mapbox</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg z-20">
          <div className="text-center max-w-md p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Map Loading Failed</h3>
            <p className="text-sm text-red-700 mb-4">{mapError}</p>
            <div className="text-xs text-left bg-white p-4 rounded border border-red-200 mb-4">
              <p className="font-semibold mb-2">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Check your Mapbox token in .env file</li>
                <li>Ensure VITE_MAPBOX_TOKEN is set correctly</li>
                <li>Verify your internet connection</li>
                <li>Check browser console for errors</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMapbox;
