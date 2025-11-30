import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const MakeAdminPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'Users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const makeAdmin = async (userId, userEmail) => {
    if (!window.confirm(`Make ${userEmail} an admin?`)) return;

    try {
      await updateDoc(doc(db, 'Users', userId), {
        role: 'admin'
      });
      alert(`${userEmail} is now an admin! They need to log out and log back in.`);
      loadUsers(); // Refresh list
    } catch (error) {
      console.error('Error making admin:', error);
      alert('Error updating user role');
    }
  };

  const removeAdmin = async (userId, userEmail) => {
    if (!window.confirm(`Remove admin role from ${userEmail}?`)) return;

    try {
      await updateDoc(doc(db, 'Users', userId), {
        role: 'user'
      });
      alert(`${userEmail} is now a regular user.`);
      loadUsers(); // Refresh list
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Error updating user role');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Important:</strong> Users must log out and log back in after role changes.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
        >
          {loading ? 'Loading...' : 'Load Users'}
        </button>

        {users.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {u.email}
                      {u.id === user?.uid && <span className="ml-2 text-blue-600">(You)</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        u.role === 'admin' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {u.role === 'admin' ? (
                        <button
                          onClick={() => removeAdmin(u.id, u.email)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => makeAdmin(u.id, u.email)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeAdminPage;
