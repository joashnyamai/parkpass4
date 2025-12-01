import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  runTransaction,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export const createBooking = async (bookingData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to create booking');
  }

  const {
    parkingSpaceId,
    parkingSpaceName,
    startTime,
    endTime,
    totalPrice,
    vehicleInfo
  } = bookingData;

  if (!parkingSpaceId || !startTime || !endTime) {
    throw new Error('Missing required booking information');
  }

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  if (isNaN(startDate) || isNaN(endDate)) {
    throw new Error('Invalid date format');
  }

  if (endDate <= startDate) {
    throw new Error('End time must be after start time');
  }

  try {
    const bookingRef = doc(collection(db, 'ParkingHistory'));
    
    await runTransaction(db, async (transaction) => {
      let spaceRef = doc(db, 'ParkingSpaces', parkingSpaceId);
      let spaceDoc = await transaction.get(spaceRef);
      
      if (!spaceDoc.exists()) {
        spaceRef = doc(db, 'parking_slots', parkingSpaceId);
        spaceDoc = await transaction.get(spaceRef);
      }
      
      if (!spaceDoc.exists()) {
        throw new Error('Parking space not found');
      }
      
      const space = spaceDoc.data();
      const availableSpots = space.availableSpots || space.available || 0;
      
      if (availableSpots <= 0) {
        throw new Error('No available spots at this parking space');
      }
      
      const newBooking = {
        userId: user.uid,
        userEmail: user.email,
        parkingSpaceId,
        parkingSpaceName,
        startTime: Timestamp.fromDate(startDate),
        endTime: Timestamp.fromDate(endDate),
        totalPrice: Number(totalPrice),
        vehicleInfo: vehicleInfo || null,
        status: 'active',
        paymentStatus: 'pending',
        paymentReference: null,
        permitGenerated: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      transaction.set(bookingRef, newBooking);
      
      const newAvailableSpots = availableSpots - 1;
      const updateData = {
        status: newAvailableSpots === 0 ? 'occupied' : 'available',
        updatedAt: serverTimestamp()
      };
      
      if (space.availableSpots !== undefined) {
        updateData.availableSpots = newAvailableSpots;
      } else {
        updateData.available = newAvailableSpots;
      }
      
      transaction.update(spaceRef, updateData);
    });
    
    return bookingRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const watchUserBookings = (userId, callback) => {
  const q = query(
    collection(db, 'ParkingHistory'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(bookings);
  }, (error) => {
    console.error('Error watching user bookings:', error);
    callback([]);
  });
};

export const updatePaymentStatus = async (bookingId, paymentStatus, paymentReference = null) => {
  try {
    await updateDoc(doc(db, 'ParkingHistory', bookingId), {
      paymentStatus,
      paymentReference,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw new Error(`Failed to update payment status: ${error.message}`);
  }
};

export const cancelBooking = async (bookingId, parkingSpaceId) => {
  try {
    await updateDoc(doc(db, 'ParkingHistory', bookingId), {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw new Error(`Failed to cancel booking: ${error.message}`);
  }
};
