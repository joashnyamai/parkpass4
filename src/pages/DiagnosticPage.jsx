import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const DiagnosticPage = () => {
  const { user } = useAuth();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const diagnostics = {};

    // Check Auth
    diagnostics.auth = {
      isAuthenticated: !!auth.currentUser,
      email: auth.currentUser?.email || 'Not logged in',
      uid: auth.currentUser?.uid || 'N/A'
    };

    // Check ParkingSpaces (new collection)
    try {
      const spacesSnapshot = await getDocs(collection(db, 'ParkingSpaces'));
      diagnostics.parkingSpaces = {
        count: spacesSnapshot.size,
        spaces: spacesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      diagnostics.parkingSpaces = {
        error: error.message
      };
    }

    // Check parking_slots (legacy collection)
    try {
      const slotsSnapshot = await getDocs(collection(db, 'parking_slots'));
      diagnostics.parking_slots = {
        count: slotsSnapshot.size,
        spaces: slotsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      };
    } catch (error) {
      diagnostics.parking_slots = {
        error: error.message
      };
    }

    // Check Users
    try {
      const usersSnapshot = await getDocs(collection(db, 'Users'));
      diagnostics.users = {
        count: usersSnapshot.size
      };
    } catch (error) {
      diagnostics.users = {
        error: error.message
      };
    }

    setResults(diagnostics);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Running diagnostics...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">System Diagnostics</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(results.auth, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">ParkingSpaces Collection (New)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(results.parkingSpaces, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">parking_slots Collection (Legacy)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(results.parking_slots, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4">Users Collection</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(results.users, null, 2)}
          </pre>
        </div>

        <button
          onClick={runDiagnostics}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Refresh Diagnostics
        </button>
      </div>
    </div>
  );
};

export default DiagnosticPage;
