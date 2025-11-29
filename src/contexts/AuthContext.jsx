/**
 * AUTH CONTEXT
 * Refactored to use centralized auth service
 */

import React, { useState, useEffect, createContext, useContext } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import * as authService from '../services/authService'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        // Try new collection first, then fall back to old one
        let profile = await authService.getUserProfile(user.uid)
        
        // If not found in Users, try users (old collection)
        if (!profile) {
          try {
            const { doc, getDoc } = await import('firebase/firestore')
            const { db } = await import('../firebase')
            const oldUserDoc = await getDoc(doc(db, 'users', user.uid))
            if (oldUserDoc.exists()) {
              profile = oldUserDoc.data()
            }
          } catch (error) {
            console.error('Error fetching from old users collection:', error)
          }
        }
        
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    signInWithGoogle: authService.signInWithGoogle,
    signUpWithEmail: authService.signUpWithEmail,
    signInWithEmail: authService.signInWithEmail,
    logout: authService.logout,
    updateUserProfile: authService.updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}