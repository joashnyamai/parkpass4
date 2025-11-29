/**
 * PARKING MAP COMPONENT - LEAFLET (No WebGL required)
 * Displays parking spaces on Leaflet with real-time updates
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (isAvailable, availableSpots) => {
  const color = isAvailable ? '#10B981' : '#EF4444';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative;">
        <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C9.373 0 4 5.373 4 12c0 6.627 12 28 12 28s12-21.373 12-28c0-6.627-5.373-12-12-12z" 
                fill="${color}" 
                stroke="white" 
                stroke-width="2"/>
          <text x="16" y="18" text-anchor="middle" fill="white" font-size="14" font-weight="bold">P</text>
        </svg>
        ${isAvailable && availableSpots ? `
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
};

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="width: 16px; height: 16px; border-radius: 50%; background: #4285F4; border: 3px solid white; box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);"></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

// Component to fit bounds
const FitBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bounds, map]);
  
  return null;
};

const ParkingMapLeaflet = ({ parkingSpaces = [], userLocation, onSpaceSelect }) => {
  const navigate = useNavigate();
  
  const center = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : [-1.286389, 36.817223]; // Nairobi default

  // Calculate bounds to fit all markers
  const bounds = [];
  if (userLocation) {
    bounds.push([userLocation.lat, userLocation.lng]);
  }
  parkingSpaces.forEach(space => {
    const coords = space.coordinates || { lat: -1.286389, lng: 36.817223 };
    bounds.push([coords.lat, coords.lng]);
  });

  console.log('🗺️ Leaflet map rendering with', parkingSpaces.length, 'parking spaces');

  return (
    <div className="w-full h-full rounded-lg relative" style={{ minHeight: '600px' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {bounds.length > 0 && <FitBounds bounds={bounds} />}
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <strong>Your Location</strong>
            </Popup>
          </Marker>
        )}
        
        {/* Parking Space Markers */}
        {parkingSpaces.map((space) => {
          const coords = space.coordinates || { lat: -1.286389, lng: 36.817223 };
          const availableSpots = space.availableSpots || space.available || 0;
          const isAvailable = space.status === 'available' && availableSpots > 0;
          const features = Array.isArray(space.features) ? space.features.slice(0, 3).join(', ') : '';
          
          return (
            <Marker
              key={space.id}
              position={[coords.lat, coords.lng]}
              icon={createCustomIcon(isAvailable, availableSpots)}
              eventHandlers={{
                click: () => {
                  if (onSpaceSelect) {
                    onSpaceSelect(space);
                  }
                }
              }}
            >
              <Popup maxWidth={300}>
                <div style={{ padding: '8px', minWidth: '250px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                    {space.name}
                  </h3>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#6B7280' }}>
                    📍 {space.location}
                  </p>
                  <div style={{ 
                    margin: '8px 0', 
                    padding: '8px', 
                    background: isAvailable ? '#ECFDF5' : '#FEE2E2', 
                    borderRadius: '6px' 
                  }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: isAvailable ? '#10B981' : '#EF4444' 
                    }}>
                      {isAvailable ? `✅ ${availableSpots} spots available` : '❌ No spots available'}
                    </p>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '16px', fontWeight: 'bold', color: '#2563EB' }}>
                    💰 KES {space.price}/hour
                  </p>
                  {features && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#6B7280' }}>
                      🎯 {features}
                    </p>
                  )}
                  {isAvailable && (
                    <button
                      onClick={() => navigate(`/booking/${space.id}`)}
                      style={{
                        marginTop: '12px',
                        width: '100%',
                        padding: '10px',
                        background: '#2563EB',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Book Now →
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
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

export default ParkingMapLeaflet;
