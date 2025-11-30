/**
 * WORKING PARKING MAP - Simplified and Reliable
 * Uses Google Maps with guaranteed rendering
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ParkingMapWorking = ({ parkingSpaces = [], userLocation, onSpaceSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🗺️ Map component mounted');
    console.log('📦 Parking spaces:', parkingSpaces.length);
    console.log('📍 User location:', userLocation);
    
    // Load Google Maps
    const loadMap = () => {
      const apiKey = import.meta.env.VITE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('❌ No Google Maps API key found');
        setError('Google Maps API key not configured');
        setIsLoading(false);
        return;
      }

      console.log('✅ API key found');

      // Check if already loaded
      if (window.google && window.google.maps) {
        console.log('✅ Google Maps already loaded');
        initializeMap();
        return;
      }

      // Load script
      console.log('📥 Loading Google Maps script...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps script loaded');
        initializeMap();
      };
      
      script.onerror = (e) => {
        console.error('❌ Failed to load Google Maps:', e);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) {
        console.error('❌ Map container not found');
        setError('Map container not ready');
        setIsLoading(false);
        return;
      }

      if (!window.google || !window.google.maps) {
        console.error('❌ Google Maps not available');
        setError('Google Maps not loaded');
        setIsLoading(false);
        return;
      }

      try {
        console.log('🎨 Creating map instance...');
        
        const center = userLocation || { lat: -1.286389, lng: 36.817223 };
        
        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 13,
          mapTypeId: 'roadmap',
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = map;
        console.log('✅ Map created successfully');
        setIsLoading(false);
        setError(null);

        // Add user location marker
        if (userLocation) {
          new window.google.maps.Marker({
            position: userLocation,
            map: map,
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
          console.log('✅ User location marker added');
        }

      } catch (err) {
        console.error('❌ Error creating map:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadMap();

    return () => {
      console.log('🧹 Cleaning up map');
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [userLocation]);

  // Add parking markers
  useEffect(() => {
    if (!mapInstanceRef.current || isLoading || !window.google) {
      console.log('⏳ Waiting for map to be ready...');
      return;
    }

    console.log('📍 Adding parking markers...');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (parkingSpaces.length === 0) {
      console.log('⚠️ No parking spaces to display');
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();

    parkingSpaces.forEach((space, index) => {
      const position = space.coordinates || { lat: -1.286389, lng: 36.817223 };
      const isAvailable = space.status === 'available' && (space.availableSpots || 0) > 0;
      const availableSpots = space.availableSpots || 0;

      console.log(`📌 Adding marker ${index + 1}: ${space.name} at`, position);

      const marker = new window.google.maps.Marker({
        position: position,
        map: mapInstanceRef.current,
        title: space.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 35 15 35s15-26.716 15-35c0-8.284-6.716-15-15-15z" 
                    fill="${isAvailable ? '#10B981' : '#EF4444'}" 
                    stroke="white" 
                    stroke-width="2"/>
              <text x="20" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">P</text>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(40, 50),
          anchor: new window.google.maps.Point(20, 50)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; min-width: 250px; font-family: system-ui;">
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

    // Fit bounds
    if (userLocation) bounds.extend(userLocation);
    mapInstanceRef.current.fitBounds(bounds);
    
    console.log(`✅ Added ${markersRef.current.length} markers`);
  }, [parkingSpaces, isLoading, onSpaceSelect, navigate]);

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
      {/* Map Container */}
      <div 
        ref={mapRef}
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
      {!isLoading && !error && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '16px',
          zIndex: 10
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
      )}

      {/* Parking Count */}
      {!isLoading && !error && parkingSpaces.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '12px 16px',
          zIndex: 10,
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

      {/* Loading State */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          zIndex: 20
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Loading Map...</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Initializing Google Maps</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fef2f2',
          zIndex: 20
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px', padding: '24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#991b1b' }}>
              Map Loading Failed
            </h3>
            <p style={{ fontSize: '14px', color: '#b91c1c', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ParkingMapWorking;
