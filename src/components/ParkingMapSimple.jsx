/**
 * PARKING MAP COMPONENT - Simple Leaflet (No React wrapper)
 * Displays parking spaces on Leaflet with real-time updates
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const ParkingMapSimple = ({ parkingSpaces = [], userLocation, onSpaceSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = React.useState(false);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  console.log('🗺️ ParkingMapSimple component rendering, parkingSpaces:', parkingSpaces.length);

  // Initialize map
  useEffect(() => {
    console.log('🗺️ Map effect running, mapRef:', !!mapRef.current, 'mapInstance:', !!mapInstanceRef.current);
    
    if (!mapRef.current) {
      console.error('❌ Map container ref not available');
      return;
    }
    
    if (mapInstanceRef.current) {
      console.log('⚠️ Map already initialized');
      return;
    }

    const center = userLocation 
      ? [userLocation.lat, userLocation.lng]
      : [-1.286389, 36.817223];

    console.log('🗺️ Creating map at center:', center);

    try {
      const map = L.map(mapRef.current).setView(center, 13);
      console.log('✅ Map instance created');

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      console.log('✅ Leaflet map initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setError(error.message);
    }

    return () => {
      // Delay cleanup to prevent race conditions
      setTimeout(() => {
        if (mapInstanceRef.current) {
          console.log('🗑️ Cleaning up map');
          try {
            mapInstanceRef.current.remove();
          } catch (error) {
            console.warn('⚠️ Error removing map:', error);
          }
          mapInstanceRef.current = null;
        }
      }, 100);
    };
  }, []);

  // Add user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    const userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div style="width: 16px; height: 16px; border-radius: 50%; background: #4285F4; border: 3px solid white; box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup('<strong>Your Location</strong>');

    mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
  }, [userLocation]);

  // Add parking markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    console.log('📍 Adding', parkingSpaces.length, 'parking markers');

    const bounds = [];

    parkingSpaces.forEach((space) => {
      const coords = space.coordinates || { lat: -1.286389, lng: 36.817223 };
      const availableSpots = space.availableSpots || space.available || 0;
      const isAvailable = space.status === 'available' && availableSpots > 0;
      const color = isAvailable ? '#10B981' : '#EF4444';

      const icon = L.divIcon({
        className: 'parking-marker',
        html: `
          <div style="position: relative; cursor: pointer;">
            <svg width="32" height="40" viewBox="0 0 32 40">
              <path d="M16 0C9.373 0 4 5.373 4 12c0 6.627 12 28 12 28s12-21.373 12-28c0-6.627-5.373-12-12-12z" 
                    fill="${color}" stroke="white" stroke-width="2"/>
              <text x="16" y="18" text-anchor="middle" fill="white" font-size="14" font-weight="bold">P</text>
            </svg>
            ${isAvailable ? `
              <div style="position: absolute; top: -5px; right: -5px; background: white; border: 2px solid ${color}; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: ${color};">
                ${availableSpots}
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
      });

      const features = Array.isArray(space.features) ? space.features.slice(0, 3).join(', ') : '';
      
      const popupContent = `
        <div style="padding: 8px; min-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${space.name}</h3>
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
              onclick="window.location.href='/booking/${space.id}'"
              style="margin-top: 12px; width: 100%; padding: 10px; background: #2563EB; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;"
            >
              Book Now →
            </button>
          ` : ''}
        </div>
      `;

      const marker = L.marker([coords.lat, coords.lng], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(popupContent)
        .on('click', () => {
          if (onSpaceSelect) {
            onSpaceSelect(space);
          }
        });

      markersRef.current.push(marker);
      bounds.push([coords.lat, coords.lng]);
    });

    // Fit bounds
    if (bounds.length > 0 && mapInstanceRef.current) {
      if (userLocation) {
        bounds.push([userLocation.lat, userLocation.lng]);
      }
      try {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch (error) {
        console.warn('⚠️ Error fitting bounds:', error);
      }
    }
  }, [parkingSpaces, onSpaceSelect, userLocation, navigate]);

  return (
    <div className="w-full h-full rounded-lg relative" style={{ minHeight: '600px' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }} />
      
      {/* Loading State */}
      {!mapReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-[2000]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Map...</h3>
            <p className="text-sm text-gray-600">Initializing Leaflet</p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg z-[2000]">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Map Error</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
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
      
      {/* Parking Count */}
      {parkingSpaces.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-[1000]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🅿️</span>
            <div>
              <p className="text-xs text-gray-600">Total Parking</p>
              <p className="text-lg font-bold text-gray-900">{parkingSpaces.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMapSimple;
