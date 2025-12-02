/**
 * ADMIN DASHBOARD - Enhanced with Real-time Management
 * Complete admin panel with users, bookings, and parking management
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, Users, ParkingSquare, DollarSign, 
  Loader2, AlertCircle, Calendar, TrendingUp,
  Settings, RefreshCw, Plus
} from "lucide-react";
import { watchDashboardStats } from "../services/adminService";
import AdminUsers from "../components/admin/AdminUsers";
import AdminBookings from "../components/admin/AdminBookings";
import AdminParkingSpaces from "../components/admin/AdminParkingSpaces";

const AdminDashboard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile?.role === "admin" || 
                  userProfile?.isAdmin === true ||
                  user?.email === "gg2techkenya@gmail.com";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }

    const unsubscribe = watchDashboardStats((data) => {
      setStats(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have admin privileges.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'parking', label: 'Parking Spaces', icon: ParkingSquare }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-100 mt-1">Manage users, bookings, and parking spaces</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/analytics')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <TrendingUp className="w-5 h-5" />
                Analytics
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'bookings' && <AdminBookings />}
        {activeTab === 'parking' && <AdminParkingSpaces />}
      </div>
    </div>
  );
};


// Overview Tab Component
const OverviewTab = ({ stats, setActiveTab }) => {
  const statCards = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'blue',
      tab: 'users'
    },
    { 
      label: 'Parking Spaces', 
      value: stats?.totalParkingSpaces || 0, 
      icon: ParkingSquare, 
      color: 'green',
      tab: 'parking'
    },
    { 
      label: 'Total Bookings', 
      value: stats?.totalBookings || 0, 
      icon: Calendar, 
      color: 'purple',
      tab: 'bookings'
    },
    { 
      label: 'Revenue (KES)', 
      value: (stats?.totalRevenue || 0).toLocaleString(), 
      icon: DollarSign, 
      color: 'green',
      tab: 'bookings'
    }
  ];

  const colorStyles = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(stat.tab)}
            className="bg-white p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${colorStyles[stat.color]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-gray-400 group-hover:text-blue-600 transition-colors">→</span>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active</span>
              <span className="font-bold text-green-600">{stats?.activeBookings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="font-bold text-blue-600">{stats?.completedBookings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-bold text-red-600">{stats?.cancelledBookings || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Paid</span>
              <span className="font-bold text-green-600">{stats?.paidBookings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="font-bold text-yellow-600">{stats?.pendingPayments || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-soft text-white">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setActiveTab('parking')}
              className="w-full flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Parking Space
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className="w-full flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <Users className="w-5 h-5" />
              Manage Users
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
