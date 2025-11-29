import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AddCoordinatesPage = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'parking_slots'));
      const spacesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSpaces(spacesData);
    } catch (error) {
      console.error('Error loading spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCoordinates = async (spaceId, lat, lng) => {
    try {
      await updateDoc(doc(db, 'parking_slots', spaceId), {
        coordinates: { lat: Number(lat), lng: Number(lng) }
      });
      alert('Coordinates updated!');
      loadSpaces();
    } catch (error) {
      console.error('Error updating coordinates:', error);
      alert('Failed to update coordinates');
    }
  };

  const addDefaultCoordinates = async () => {
    setUpdating(true);
    // Default coordinates around Nairobi CBD
    const defaultLocations = [
      { lat: -1.2864, lng: 36.8172 }, // Nairobi CBD
      { lat: -1.2921, lng: 36.8219 }, // Westlands
      { lat: -1.3032, lng: 36.7073 }, // Karen
      { lat: -1.2195, lng: 36.8857 }, // Thika Road
    ];

    try {
      for (let i = 0; i < spaces.length; i++) {
        const space = spaces[i];
        if (!space.coordinates || (space.coordinates.lat === 0 && space.coordinates.lng === 0)) {
          const coords = defaultLocations[i % defaultLocations.length];
          await updateDoc(doc(db, 'parking_slots', space.id), {
            coordinates: coords
          });
        }
      }
      alert('Default coordinates added!');
      loadSpaces();
    } catch (error) {
      console.error('Error adding default coordinates:', error);
      alert('Failed to add coordinates');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add Coordinates to Parking Spaces</h1>
        
        <button
          onClick={addDefaultCoordinates}
          disabled={updating}
          className="mb-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {updating ? 'Updating...' : 'Add Default Coordinates to All'}
        </button>

        <div className="space-y-4">
          {spaces.map((space) => (
            <div key={space.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">{space.name}</h3>
              <p className="text-gray-600 mb-4">{space.location}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    defaultValue={space.coordinates?.lat || -1.286389}
                    id={`lat-${space.id}`}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    defaultValue={space.coordinates?.lng || 36.817223}
                    id={`lng-${space.id}`}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <button
                onClick={() => {
                  const lat = document.getElementById(`lat-${space.id}`).value;
                  const lng = document.getElementById(`lng-${space.id}`).value;
                  updateCoordinates(space.id, lat, lng);
                }}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Update Coordinates
              </button>
              
              <p className="mt-2 text-xs text-gray-500">
                Current: {space.coordinates ? `${space.coordinates.lat}, ${space.coordinates.lng}` : 'Not set'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddCoordinatesPage;
