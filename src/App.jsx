/**
 * MAIN APP COMPONENT
 * Refactored with proper context providers and routing
 */

import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ParkingProvider } from './contexts/ParkingContext'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import BookingPage from './pages/BookingPage'
import DiagnosticPage from './pages/DiagnosticPage'
import AddCoordinatesPage from './pages/AddCoordinatesPage'

// -------------------- Protected Route --------------------
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

// -------------------- Admin-Only Route --------------------
const AdminRoute = ({ children }) => {
  const { user, userProfile } = useAuth()
  
  // Check if user is admin by role or email
  const isAdmin = userProfile?.role === 'admin' || 
                  user?.email === 'gg2techkenya@gmail.com'
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return isAdmin ? children : <Navigate to="/dashboard" replace />
}

// -------------------- APP COMPONENT --------------------
function App() {
  return (
    <AuthProvider>
      <ParkingProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="pt-4">
              <Routes>

              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* User Protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/booking/:id"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/booking"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Diagnostic Page */}
              <Route path="/diagnostic" element={<DiagnosticPage />} />
              
              {/* Add Coordinates Page */}
              <Route path="/add-coordinates" element={<AddCoordinatesPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

              </Routes>
            </main>
          </div>
        </Router>
      </ParkingProvider>
    </AuthProvider>
  )
}

export default App
