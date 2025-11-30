/**
 * LEAFLET MAP - Simple and Reliable
 * No WebGL issues, works everywhere
 */

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, label) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 50px;
      ">
        <svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 35 15 35s15-26.716 15-35c0-8.284-6.716-15-15-15z" 
                fill="${color}" 
                stroke="white" 
                stroke-width="2"/>
          <text x="20" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">P</text>
          ${label ? `
            <circle cx="32" cy="8" r="8" fill="white" stroke="${color}" stroke-width="2"/>
            <text x="32" y="12" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold">${label}</text>
          ` : ''}
        </svg>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -50]
  });
};

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4285F4;
      border: 3px solid white;
      box-shadow: 0 0 10px rgba(66, 133, 244, 0.5);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10]
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

const ParkingMapLeafletWorking = ({ parkingSpaces = [], userLocation, onSpaceSelect }) => {
  const navigate = useNavigate();
  
  // Default center (Nairobi)
  const defaultCenter = [-1.286389, 36.817223];
  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;
  
  // Calculate bounds
  const bounds = [];
  if (userLocation && userLocation.lat && userLocation.lng) {
    bounds.push([userLocation.lat, userLocation.lng]);
  }
  
  parkingSpaces.forEach(space => {
    if (space.coordinates && space.coordinates.lat && space.coordinates.lng) {
      bounds.push([space.coordinates.lat, space.coordinates.lng]);
    }
  });

  console.log('🗺️ Leaflet Map - Parking spaces:', parkingSpaces.length);
  console.log('📍 Leaflet Map - Bounds:', bounds.length);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%', minHeight: '600px', borderRadius: '0.5rem' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Fit bounds */}
        {bounds.length > 0 && <FitBounds bounds={bounds} />}
        
        {/* User location marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>
              <div style={{ padding: '8px', textAlign: 'center' }}>
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Parking space markers */}
        {parkingSpaces.map((space) => {
          if (!space.coordinates || !space.coordinates.lat || !space.coordinates.lng) {
            console.warn('⚠️ Skipping space with invalid coordinates:', space.name);
            return null;
          }
          
          const isAvailable = space.status === 'available' && (space.availableSpots || 0) > 0;
          const availableSpots = space.availableSpots || 0;
          const color = isAvailable ? '#10B981' : '#EF4444';
          const icon = createCustomIcon(color, isAvailable ? availableSpots : null);
          
          return (
            <Marker
              key={space.id}
              position={[space.coordinates.lat, space.coordinates.lng]}
              icon={icon}
              eventHandlers={{
                click: () => {
                  if (onSpaceSelect) onSpaceSelect(space);
                }
              }}
            >
              <Popup>
                <div style={{ padding: '12px', minWidth: '250px', fontFamily: 'system-ui' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                    {space.name}
                  </h3>
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
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
                      fontWeight: '600',
                      color: isAvailable ? '#10B981' : '#EF4444'
                    }}>
                      {isAvailable ? `✅ ${availableSpots} spots available` : '❌ No spots available'}
                    </p>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '16px', fontWeight: 'bold', color: '#2563EB' }}>
                    💰 KES {space.price}/hour
                  </p>
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
                        fontWeight: '600',
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
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '16px',
        zIndex: 1000
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>Legend</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
            <span style={{ fontSize: '12px' }}>Available</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
            <span style={{ fontSize: '12px' }}>Full</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#4285F4' }}></div>
            <span style={{ fontSize: '12px' }}>Your Location</span>
          </div>
        </div>
      </div>
      
      {/* Parking count */}
      {parkingSpaces.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '12px 16px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>🅿️</span>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Total Parking</p>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{parkingSpaces.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingMapLeafletWorking;
