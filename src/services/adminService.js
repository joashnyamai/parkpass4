/**
 * ADMIN SERVICE - Enhanced with Real-time CRUD Operations
 * Handles admin-specific operations including:
 * - Real-time user management (fetch, edit, delete)
 * - Real-time booking management (fetch, edit, delete)
 * - Parking space management
 * - Analytics and reporting
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '../firebase';

// ==================== USER MANAGEMENT ====================

/**
 * Real-time listener for all users
 * Fetches from both 'Users' and 'users' collections
 */
export const getUsersRealTime = (callback, onError) => {
  const usersRef = collection(db, 'Users');
  
  return onSnapshot(
    query(usersRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
        updatedAt: doc.data().updatedAt?.toDate?.() || null
      }));
      callback(users);
    },
    (error) => {
      console.error('Error fetching users:', error);
      // Try legacy collection
      const legacyRef = collection(db, 'users');
      return onSnapshot(
        legacyRef,
        (snapshot) => {
          const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || null
          }));
          callback(users);
        },
        (err) => {
          console.error('Error fetching from legacy users:', err);
          if (onError) onError(err);
          callback([]);
        }
      );
    }
  );
};

/**
 * Get single user by ID
 */
export const getUser = async (userId) => {
  try {
    let userDoc = await getDoc(doc(db, 'Users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    // Try legacy collection
    userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Update user details
 */
export const updateUser = async (userId, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Try Users collection first
    const userRef = doc(db, 'Users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await updateDoc(userRef, updateData);
    } else {
      // Try legacy collection
      await updateDoc(doc(db, 'users', userId), updateData);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error(`Failed to update user: ${error.message}`);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  try {
    // Try Users collection first
    const userRef = doc(db, 'Users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      await deleteDoc(userRef);
    } else {
      // Try legacy collection
      await deleteDoc(doc(db, 'users', userId));
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

// ==================== BOOKING MANAGEMENT ====================

/**
 * Real-time listener for all bookings
 */
export const getBookingsRealTime = (callback, onError) => {
  const bookingsRef = collection(db, 'ParkingHistory');
  
  return onSnapshot(
    query(bookingsRef, orderBy('createdAt', 'desc')),
    (snapshot) => {
      const bookings = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startTime: data.startTime?.toDate?.() || null,
          endTime: data.endTime?.toDate?.() || null,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null
        };
      });
      callback(bookings);
    },
    (error) => {
      console.error('Error fetching bookings:', error);
      if (onError) onError(error);
      callback([]);
    }
  );
};

/**
 * Get single booking by ID
 */
export const getBooking = async (bookingId) => {
  try {
    const bookingDoc = await getDoc(doc(db, 'ParkingHistory', bookingId));
    if (bookingDoc.exists()) {
      const data = bookingDoc.data();
      return {
        id: bookingDoc.id,
        ...data,
        startTime: data.startTime?.toDate?.() || null,
        endTime: data.endTime?.toDate?.() || null
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

/**
 * Update booking details
 */
export const updateBooking = async (bookingId, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    // Handle date conversions if needed
    if (data.startTime && !(data.startTime instanceof Date)) {
      updateData.startTime = new Date(data.startTime);
    }
    if (data.endTime && !(data.endTime instanceof Date)) {
      updateData.endTime = new Date(data.endTime);
    }
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(doc(db, 'ParkingHistory', bookingId), updateData);
    return true;
  } catch (error) {
    console.error('Error updating booking:', error);
    throw new Error(`Failed to update booking: ${error.message}`);
  }
};

/**
 * Delete booking
 */
export const deleteBooking = async (bookingId) => {
  try {
    await deleteDoc(doc(db, 'ParkingHistory', bookingId));
    return true;
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw new Error(`Failed to delete booking: ${error.message}`);
  }
};

// ==================== PARKING SPACE MANAGEMENT ====================

/**
 * Real-time listener for all parking spaces
 */
export const getParkingSpacesRealTime = (callback, onError) => {
  const spacesRef = collection(db, 'ParkingSpaces');
  const slotsRef = collection(db, 'parking_slots');
  
  let spaces1 = [];
  let spaces2 = [];
  
  const mergeAndCallback = () => {
    const allSpaces = [...spaces1];
    spaces2.forEach(space2 => {
      if (!spaces1.find(s => s.id === space2.id)) {
        allSpaces.push(space2);
      }
    });
    callback(allSpaces);
  };
  
  const unsub1 = onSnapshot(spacesRef, (snapshot) => {
    spaces1 = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null
    }));
    mergeAndCallback();
  }, (error) => {
    console.error('Error fetching ParkingSpaces:', error);
    spaces1 = [];
    mergeAndCallback();
  });
  
  const unsub2 = onSnapshot(slotsRef, (snapshot) => {
    spaces2 = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null
    }));
    mergeAndCallback();
  }, (error) => {
    console.error('Error fetching parking_slots:', error);
    spaces2 = [];
    mergeAndCallback();
  });
  
  return () => {
    unsub1();
    unsub2();
  };
};

/**
 * Update parking space
 */
export const updateParkingSpace = async (spaceId, data) => {
  try {
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    // Try ParkingSpaces first
    const spaceRef = doc(db, 'ParkingSpaces', spaceId);
    const spaceDoc = await getDoc(spaceRef);
    
    if (spaceDoc.exists()) {
      await updateDoc(spaceRef, updateData);
    } else {
      // Try parking_slots
      await updateDoc(doc(db, 'parking_slots', spaceId), updateData);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating parking space:', error);
    throw new Error(`Failed to update parking space: ${error.message}`);
  }
};

/**
 * Delete parking space
 */
export const deleteParkingSpace = async (spaceId) => {
  try {
    // Try ParkingSpaces first
    const spaceRef = doc(db, 'ParkingSpaces', spaceId);
    const spaceDoc = await getDoc(spaceRef);
    
    if (spaceDoc.exists()) {
      await deleteDoc(spaceRef);
    } else {
      // Try parking_slots
      await deleteDoc(doc(db, 'parking_slots', spaceId));
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting parking space:', error);
    throw new Error(`Failed to delete parking space: ${error.message}`);
  }
};

// ==================== STATISTICS ====================

/**
 * Get dashboard statistics (real-time)
 */
export const watchDashboardStats = (callback) => {
  let stats = {
    totalUsers: 0,
    totalParkingSpaces: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    pendingPayments: 0,
    paidBookings: 0
  };
  
  const unsubUsers = onSnapshot(collection(db, 'Users'), (snap) => {
    stats.totalUsers = snap.size;
    callback({ ...stats });
  });
  
  const unsubSpaces = onSnapshot(collection(db, 'ParkingSpaces'), (snap) => {
    stats.totalParkingSpaces = snap.size;
    callback({ ...stats });
  });
  
  const unsubSlots = onSnapshot(collection(db, 'parking_slots'), (snap) => {
    stats.totalParkingSpaces += snap.size;
    callback({ ...stats });
  });
  
  const unsubBookings = onSnapshot(collection(db, 'ParkingHistory'), (snap) => {
    const bookings = snap.docs.map(doc => doc.data());
    stats.totalBookings = bookings.length;
    stats.totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    stats.activeBookings = bookings.filter(b => b.status === 'active').length;
    stats.completedBookings = bookings.filter(b => b.status === 'completed').length;
    stats.cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    stats.pendingPayments = bookings.filter(b => b.paymentStatus === 'pending').length;
    stats.paidBookings = bookings.filter(b => b.paymentStatus === 'paid').length;
    callback({ ...stats });
  });
  
  return () => {
    unsubUsers();
    unsubSpaces();
    unsubSlots();
    unsubBookings();
  };
};

/**
 * Get dashboard statistics (one-time)
 */
export const getDashboardStats = async () => {
  try {
    const [usersSnap, spacesSnap, slotsSnap, bookingsSnap] = await Promise.all([
      getDocs(collection(db, 'Users')),
      getDocs(collection(db, 'ParkingSpaces')),
      getDocs(collection(db, 'parking_slots')),
      getDocs(collection(db, 'ParkingHistory'))
    ]);
    
    const bookings = bookingsSnap.docs.map(doc => doc.data());
    
    return {
      totalUsers: usersSnap.size,
      totalParkingSpaces: spacesSnap.size + slotsSnap.size,
      totalBookings: bookingsSnap.size,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      activeBookings: bookings.filter(b => b.status === 'active').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length,
      cancelledBookings: bookings.filter(b => b.status === 'cancelled').length
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Legacy exports for backward compatibility
export const watchAllUsers = getUsersRealTime;
export const getAllUsers = async () => {
  const snapshot = await getDocs(collection(db, 'Users'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
export const updateUserRole = async (userId, role) => updateUser(userId, { role });
