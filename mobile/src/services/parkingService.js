import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const watchParkingSpaces = (callback) => {
  const q1 = collection(db, 'ParkingSpaces');
  const q2 = collection(db, 'parking_slots');
  
  let spaces1 = [];
  let spaces2 = [];
  
  const mergeAndCallback = () => {
    const allSpaces = [...spaces1];
    
    spaces2.forEach(space2 => {
      if (!spaces1.find(s => s.id === space2.id)) {
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
    
    callback(allSpaces);
  };
  
  const unsubscribe1 = onSnapshot(q1, (snapshot) => {
    spaces1 = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
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
    mergeAndCallback();
  }, (error) => {
    console.error('Error watching parking_slots:', error);
    spaces2 = [];
    mergeAndCallback();
  });
  
  return () => {
    if (unsubscribe1) unsubscribe1();
    if (unsubscribe2) unsubscribe2();
  };
};

export const getParkingSpace = async (spaceId) => {
  try {
    let spaceDoc = await getDoc(doc(db, 'ParkingSpaces', spaceId));
    if (spaceDoc.exists()) {
      return { id: spaceDoc.id, ...spaceDoc.data() };
    }
    
    spaceDoc = await getDoc(doc(db, 'parking_slots', spaceId));
    if (spaceDoc.exists()) {
      const data = spaceDoc.data();
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
    
    return null;
  } catch (error) {
    console.error('Error fetching parking space:', error);
    throw new Error(`Failed to fetch parking space: ${error.message}`);
  }
};

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
