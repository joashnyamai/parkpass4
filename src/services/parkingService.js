/**
 * REAL-TIME PARKING MODULE
 * Handles all parking space operations including:
 * - Real-time parking space updates using onSnapshot()
 * - Parking space availability management
 * - Booking operations
 * - Status updates
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../firebase';

/**
 * Real-time listener for all parking spaces
 * Uses onSnapshot() for live updates
 * Checks both ParkingSpaces and parking_slots collections
 */
export const watchParkingSpaces = (callback) => {
  // Try new collection first
  const q1 = collection(db, 'ParkingSpaces');
  const q2 = collection(db, 'parking_slots');
  
  let spaces1 = [];
  let spaces2 = [];
  
  const mergeAndCallback = () => {
    // Merge both collections, preferring ParkingSpaces
    const allSpaces = [...spaces1];
    
    // Add parking_slots that aren't in ParkingSpaces
    spaces2.forEach(space2 => {
      if (!spaces1.find(s => s.id === space2.id)) {
        // Convert old format to new format
        allSpaces.push({
          ...space2,
          totalSpots: space2.total || 0,
          availableSpots: space2.available || 0,
          imageUrl: space2.image || '',
          totalReviews: space2.reviews || 0,
          coordinates: space2.coordinates || { lat: 0, lng: 0 }
        });
      }
    });
    
    console.log('📍 Parking spaces loaded:', allSpaces.length);
    callback(allSpaces);
  };
  
  const unsubscribe1 = onSnapshot(q1, (snapshot) => {
    spaces1 = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('📦 ParkingSpaces collection:', spaces1.length, 'spaces');
    mergeAndCallback();
  }, (error) => {
    console.error('Error watching ParkingSpaces:', error);
    spaces1 = [];
    mergeAndCallback();
  });
  
  const unsubscribe2 = onSnapshot(q2, (snapshot) => {
    spaces2 = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('📦 parking_slots collection:', spaces2.length, 'spaces');
    mergeAndCallback();
  }, (error) => {
    console.error('Error watching parking_slots:', error);
    spaces2 = [];
    mergeAndCallback();
  });
  
  // Return combined unsubscribe function
  return () => {
    if (unsubscribe1) unsubscribe1();
    if (unsubscribe2) unsubscribe2();
  };
};

/**
 * Real-time listener for available parking spaces only
 */
export const watchAvailableParkingSpaces = (callback) => {
  const q = query(
    collection(db, 'ParkingSpaces'),
    where('status', '==', 'available')
  );
  
  return onSnapshot(q, (snapshot) => {
    const spaces = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(spaces);
  }, (error) => {
    console.error('Error watching available parking spaces:', error);
    callback([]);
  });
};

/**
 * Get single parking space by ID
 * Checks both ParkingSpaces and parking_slots collections
 */
export const getParkingSpace = async (spaceId) => {
  try {
    // Try ParkingSpaces first
    let spaceDoc = await getDoc(doc(db, 'ParkingSpaces', spaceId));
    if (spaceDoc.exists()) {
      console.log('✅ Found in ParkingSpaces:', spaceDoc.data());
      return { id: spaceDoc.id, ...spaceDoc.data() };
    }
    
    // Try legacy parking_slots collection
    spaceDoc = await getDoc(doc(db, 'parking_slots', spaceId));
    if (spaceDoc.exists()) {
      console.log('✅ Found in parking_slots:', spaceDoc.data());
      const data = spaceDoc.data();
      // Convert old format to new format
      return {
        id: spaceDoc.id,
        ...data,
        totalSpots: data.total || data.totalSpots || 0,
        availableSpots: data.available || data.availableSpots || 0,
        imageUrl: data.image || data.imageUrl || '',
        totalReviews: data.reviews || data.totalReviews || 0,
        coordinates: data.coordinates || { lat: 0, lng: 0 }
      };
    }
    
    console.log('❌ Parking space not found in either collection');
    return null;
  } catch (error) {
    console.error('Error fetching parking space:', error);
    throw new Error(`Failed to fetch parking space: ${error.message}`);
  }
};

/**
 * Get all parking spaces (non-realtime)
 */
export const getAllParkingSpaces = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'ParkingSpaces'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching parking spaces:', error);
    throw new Error(`Failed to fetch parking spaces: ${error.message}`);
  }
};

/**
 * Create new parking space (Admin only)
 */
export const createParkingSpace = async (spaceData) => {
  try {
    const newSpace = {
      name: spaceData.name,
      location: spaceData.location,
      address: spaceData.address || '',
      coordinates: spaceData.coordinates || { lat: 0, lng: 0 },
      price: Number(spaceData.price),
      totalSpots: Number(spaceData.totalSpots),
      availableSpots: Number(spaceData.availableSpots || spaceData.totalSpots),
      status: 'available',
      features: spaceData.features || [],
      imageUrl: spaceData.imageUrl || '',
      rating: 0,
      totalReviews: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'ParkingSpaces'), newSpace);
    return docRef.id;
  } catch (error) {
    console.error('Error creating parking space:', error);
    throw new Error(`Failed to create parking space: ${error.message}`);
  }
};

/**
 * Update parking space (Admin only)
 */
export const updateParkingSpace = async (spaceId, updates) => {
  try {
    await updateDoc(doc(db, 'ParkingSpaces', spaceId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating parking space:', error);
    throw new Error(`Failed to update parking space: ${error.message}`);
  }
};

/**
 * Delete parking space (Admin only)
 */
export const deleteParkingSpace = async (spaceId) => {
  try {
    await deleteDoc(doc(db, 'ParkingSpaces', spaceId));
    return true;
  } catch (error) {
    console.error('Error deleting parking space:', error);
    throw new Error(`Failed to delete parking space: ${error.message}`);
  }
};

/**
 * Update parking space availability
 * Called when booking is made or released
 */
export const updateParkingAvailability = async (spaceId, increment = -1) => {
  try {
    const spaceRef = doc(db, 'ParkingSpaces', spaceId);
    
    await runTransaction(db, async (transaction) => {
      const spaceDoc = await transaction.get(spaceRef);
      
      if (!spaceDoc.exists()) {
        throw new Error('Parking space not found');
      }
      
      const currentAvailable = spaceDoc.data().availableSpots;
      const newAvailable = currentAvailable + increment;
      
      if (newAvailable < 0) {
        throw new Error('No available spots');
      }
      
      const newStatus = newAvailable === 0 ? 'occupied' : 'available';
      
      transaction.update(spaceRef, {
        availableSpots: newAvailable,
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    });
    
    return true;
  } catch (error) {
    console.error('Error updating parking availability:', error);
    throw error;
  }
};
