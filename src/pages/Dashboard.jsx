/**
 * DASHBOARD PAGE - Refactored
 * Uses new hooks and contexts
 */
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useParkingContext } from "../contexts/ParkingContext";
import { useRealTimeBookings } from "../hooks/useRealTimeBookings";
import { useNavigate } from "react-router-dom";
import { Car, Calendar, History, Clock } from "lucide-react";
import ParkingSpaceCard from "../components/ParkingSpaceCard";

const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const { parkingSpaces, loading: spacesLoading } = useParkingContext();
  const { bookings: userBookings, loading: bookingsLoading } = useRealTimeBookings();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("available");

  const loading = spacesLoading || bookingsLoading;

  if (!user) {
    navigate("/login");
    return null;
  }

  const availableSpaces = parkingSpaces.filter(space => 
    space.status === "available" && space.availableSpots > 0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.displayName || user?.displayName || "User"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Find and book your perfect parking spot in Kenya
        </p>
      </div>



      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Spots</p>
              <p className="text-2xl font-semibold text-gray-900">{parkingSpaces.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Available Now</p>
              <p className="text-2xl font-semibold text-gray-900">{availableSpaces.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Your Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{userBookings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("available")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "available"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Available Parking ({availableSpaces.length})
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "bookings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Bookings ({userBookings.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "available" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Available Parking Spots</h2>
              {availableSpaces.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Available Parking Spots</h3>
                  <p className="text-gray-500 mt-2">
                    All parking spots are currently booked. Check back later for availability.
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse All Spots
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableSpaces.map((space) => (
                    <ParkingSpaceCard 
                      key={space.id} 
                      space={space}
                      distance={space.distance}
                      showNavigation={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Your Booking History</h2>
              {userBookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Bookings Yet</h3>
                  <p className="text-gray-500 mt-2">Book your first parking spot to see it here</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Find Parking
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userBookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {booking.parkingSpotName || "Parking Spot"}
                            </h3>
                            <p className="text-gray-600 mt-1">{booking.location || "Location not specified"}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {booking.startTime} - {booking.endTime}
                              </span>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === "confirmed" 
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || "Unknown"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-xl font-bold text-blue-600">KES {booking.totalPrice || "0"}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.createdAt?.toDate ? 
                            new Date(booking.createdAt.toDate()).toLocaleDateString('en-KE', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 
                            "Date not available"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {parkingSpaces.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Parking Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{parkingSpaces.length}</p>
              <p className="text-sm text-gray-600">Total Spots</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{availableSpaces.length}</p>
              <p className="text-sm text-gray-600">Available Now</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{userBookings.length}</p>
              <p className="text-sm text-gray-600">Your Bookings</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;