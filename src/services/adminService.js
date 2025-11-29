/**
 * ADMIN MODULE
 * Handles admin-specific operations including:
 * - User management
 * - Parking space management
 * - Booking oversight
 * - Analytics and reporting
 */

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Real-time listener for all users (Admin only)
 */
export const watchAllUsers = (callback) => {
  const q = collection(db, 'Users');
  
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(users);
  }, (error) => {
    console.error('Error watching users:', error);
    callback([]);
  });
};

/**
 * Get all users (non-realtime)
 */
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'Users'));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
};

/**
 * Update user role (Admin only)
 */
export const updateUserRole = async (userId, role) => {
  try {
    await updateDoc(doc(db, 'Users', userId), {
      role,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error(`Failed to update user role: ${error.message}`);
  }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (userId) => {
  try {
    await deleteDoc(doc(db, 'Users', userId));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(`Failed to delete user: ${error.message}`);
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const [usersSnap, spacesSnap, bookingsSnap] = await Promise.all([
      getDocs(collection(db, 'Users')),
      getDocs(collection(db, 'ParkingSpaces')),
      getDocs(collection(db, 'ParkingHistory'))
    ]);
    
    const bookings = bookingsSnap.docs.map(doc => doc.data());
    const totalRevenue = bookings.reduce((sum, booking) => 
      sum + (booking.totalPrice || 0), 0
    );
    
    return {
      totalUsers: usersSnap.size,
      totalParkingSpaces: spacesSnap.size,
      totalBookings: bookingsSnap.size,
      totalRevenue,
      activeBookings: bookings.filter(b => b.status === 'active').length,
      completedBookings: bookings.filter(b => b.status === 'completed').length
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error(`Failed to fetch statistics: ${error.message}`);
  }
};
