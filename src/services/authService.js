/**
 * AUTH MODULE
 * Handles all authentication operations including:
 * - Email/Password authentication
 * - Google OAuth
 * - User profile management
 * - Role-based access control
 */

import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc,
  getDoc,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Sign in with Google OAuth
 * Creates user profile in Firestore if first time
 */
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Create or update user profile in Users collection
    await setDoc(doc(db, 'Users', result.user.uid), {
      uid: result.user.uid,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      role: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw new Error(`Google sign-in failed: ${error.message}`);
  }
};

/**
 * Sign up with email and password
 * Creates user profile with default role
 */
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    
    // Create user profile in Users collection
    await setDoc(doc(db, 'Users', result.user.uid), {
      uid: result.user.uid,
      displayName,
      email,
      photoURL: null,
      role: 'user',
      phoneNumber: null,
      vehicleInfo: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return result.user;
  } catch (error) {
    console.error('Email sign-up error:', error);
    throw new Error(`Sign up failed: ${error.message}`);
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw new Error(`Sign in failed: ${error.message}`);
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'Users', uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (uid, updates) => {
  try {
    await setDoc(doc(db, 'Users', uid), {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error(`Profile update failed: ${error.message}`);
  }
};

/**
 * Sign out current user
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error(`Logout failed: ${error.message}`);
  }
};

/**
 * Check if user has admin role
 */
export const isAdmin = async (uid) => {
  const profile = await getUserProfile(uid);
  return profile?.role === 'admin';
};
