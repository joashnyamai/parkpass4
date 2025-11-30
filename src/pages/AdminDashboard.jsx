import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { BarChart3, Users, ParkingSquare, DollarSign, Loader2, AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  // Check admin status from both new and old collections
  const isAdmin = userProfile?.role === "admin" || 
                  userProfile?.isAdmin === true ||
                  user?.email === "gg2techkenya@gmail.com";
  
  console.log('🔐 Admin check:', { 
    userEmail: user?.email,
    userProfileRole: userProfile?.role,
    userProfileIsAdmin: userProfile?.isAdmin,
    isAdmin,
    fullUserProfile: userProfile
  });

  const [usersCount, setUsersCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [slotsCount, setSlotsCount] = useState(0);
  const [slotsList, setSlotsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [newSpot, setNewSpot] = useState({
    name: "",
    location: "",
    status: "available",
    price: "",
    available: "",
    total: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Edit state
  const [editingSpot, setEditingSpot] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }

    setLoading(true);

    // Real-time counts
    const unsubUsers = onSnapshot(
      collection(db, "users"), 
      (snap) => {
        setUsersCount(snap.docs.length);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load user data");
        setLoading(false);
      }
    );

    const unsubBookings = onSnapshot(
      collection(db, "ParkingHistory"), 
      (snap) => {
        const bookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBookingsCount(bookings.length);
        setBookingsList(bookings);
        
        // Calculate total revenue
        const revenue = bookings.reduce((sum, booking) => {
          return sum + (booking.totalPrice || 0);
        }, 0);
        setTotalRevenue(revenue);
      },
      (err) => console.error("Error fetching bookings:", err)
    );

    const unsubSlots = onSnapshot(
      collection(db, "parking_slots"), 
      (snap) => {
        setSlotsCount(snap.docs.length);
        setSlotsList(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (err) => console.error("Error fetching slots:", err)
    );

    return () => {
      unsubUsers();
      unsubBookings();
      unsubSlots();
    };
  }, [isAdmin, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSpot({ ...newSpot, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const storageRef = ref(storage, `parking_images/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  };

  const handleAddSpot = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate inputs
      if (Number(newSpot.price) <= 0) {
        alert("Price must be greater than 0");
        setSubmitting(false);
        return;
      }

      if (newSpot.total && Number(newSpot.total) <= 0) {
        alert("Total spots must be greater than 0");
        setSubmitting(false);
        return;
      }

      if (newSpot.available && newSpot.total && Number(newSpot.available) > Number(newSpot.total)) {
        alert("Available spots cannot exceed total spots");
        setSubmitting(false);
        return;
      }

      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const spotData = {
        name: newSpot.name.trim(),
        location: newSpot.location.trim(),
        status: newSpot.status,
        price: Number(newSpot.price),
        image: imageUrl || "",
        imageUrl: imageUrl || "", // Both field names for compatibility
        features: ["Covered", "24/7", "CCTV"],
        rating: 0,
        reviews: 0,
        totalReviews: 0, // Both field names
        distance: 0,
        available: newSpot.available ? Number(newSpot.available) : 0,
        availableSpots: newSpot.available ? Number(newSpot.available) : 0, // Both field names
        total: newSpot.total ? Number(newSpot.total) : 0,
        totalSpots: newSpot.total ? Number(newSpot.total) : 0, // Both field names
        coordinates: { lat: -1.286389, lng: 36.817223 }, // Default Nairobi coordinates
        createdAt: serverTimestamp(),
      };

      // Write to parking_slots collection only (with both old and new field names)
      await addDoc(collection(db, "parking_slots"), spotData);

      alert("Parking spot added successfully!");
      
      // Reset form
      setNewSpot({ 
        name: "", 
        location: "", 
        status: "available", 
        price: "", 
        available: "",
        total: ""
      });
      setImageFile(null);
      setImagePreview(null);

    } catch (err) {
      console.error("Error adding parking spot:", err);
      alert(`Error adding parking spot: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSpot = (spot) => {
    setEditingSpot({
      id: spot.id,
      name: spot.name,
      location: spot.location,
      status: spot.status,
      price: spot.price,
      available: spot.available || spot.availableSpots || 0,
      total: spot.total || spot.totalSpots || 0,
      imageUrl: spot.image || spot.imageUrl || ""
    });
    setShowEditModal(true);
  };

  const handleUpdateSpot = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate inputs
      if (Number(editingSpot.price) <= 0) {
        alert("Price must be greater than 0");
        setSubmitting(false);
        return;
      }

      if (editingSpot.total && Number(editingSpot.total) <= 0) {
        alert("Total spots must be greater than 0");
        setSubmitting(false);
        return;
      }

      if (editingSpot.available && editingSpot.total && Number(editingSpot.available) > Number(editingSpot.total)) {
        alert("Available spots cannot exceed total spots");
        setSubmitting(false);
        return;
      }

      let imageUrl = editingSpot.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const spotData = {
        name: editingSpot.name.trim(),
        location: editingSpot.location.trim(),
        status: editingSpot.status,
        price: Number(editingSpot.price),
        image: imageUrl || "",
        imageUrl: imageUrl || "",
        available: editingSpot.available ? Number(editingSpot.available) : 0,
        availableSpots: editingSpot.available ? Number(editingSpot.available) : 0,
        total: editingSpot.total ? Number(editingSpot.total) : 0,
        totalSpots: editingSpot.total ? Number(editingSpot.total) : 0,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "parking_slots", editingSpot.id), spotData);

      alert("Parking spot updated successfully!");
      setShowEditModal(false);
      setEditingSpot(null);
      setImageFile(null);
      setImagePreview(null);

    } catch (err) {
      console.error("Error updating parking spot:", err);
      alert(`Error updating parking spot: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSpot = async (id, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this parking spot?")) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "parking_slots", id));

      // Delete image from Storage if it exists
      if (imageUrl && imageUrl.includes('firebase')) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (imgErr) {
          console.error("Error deleting image:", imgErr);
          // Continue even if image deletion fails
        }
      }

      alert("Parking spot deleted successfully!");
    } catch (err) {
      console.error("Error deleting spot:", err);
      alert(`Error deleting spot: ${err.message}`);
    }
  };

  // Revenue is now calculated from real booking data

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have admin privileges to access this page.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => navigate('/analytics')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <BarChart3 className="w-5 h-5" />
          View Analytics
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Stat icon={Users} label="Total Users" value={usersCount} color="blue" />
        <Stat icon={ParkingSquare} label="Parking Spots" value={slotsCount} color="green" />
        <Stat icon={DollarSign} label="Revenue (KES)" value={totalRevenue.toLocaleString()} color="green" />
        <Stat icon={BarChart3} label="Bookings" value={bookingsCount} color="orange" />
      </div>

      {/* ADD NEW PARKING SPOT */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Parking Spot</h2>
        <form onSubmit={handleAddSpot} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spot Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Downtown Parking Plaza"
              value={newSpot.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              placeholder="e.g., 123 Main Street, Nairobi"
              value={newSpot.location}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (KSH) *
              </label>
              <input
                type="number"
                name="price"
                placeholder="100"
                min="1"
                value={newSpot.price}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={newSpot.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="booked">Booked</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Spots
              </label>
              <input
                type="number"
                name="available"
                placeholder="10"
                min="0"
                value={newSpot.available}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Spots
              </label>
              <input
                type="number"
                name="total"
                placeholder="20"
                min="0"
                value={newSpot.total}
                onChange={handleInputChange}
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded"
                />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Spot"
            )}
          </button>
        </form>
      </div>

      {/* PARKING SPOT LIST */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          All Parking Spots ({slotsList.length})
        </h2>
        
        {slotsList.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No parking spots added yet. Add your first spot above!
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slotsList.map((spot) => (
              <div key={spot.id} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <img
                  src={spot.image || "https://via.placeholder.com/400x300?text=No+Image"}
                  alt={spot.name}
                  className="w-full h-40 object-cover rounded mb-3"
                />

                <h3 className="font-semibold text-lg mb-1">{spot.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{spot.location}</p>
                
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    <span className={`px-2 py-1 rounded text-xs ${
                      spot.status === 'available' ? 'bg-green-100 text-green-800' :
                      spot.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {spot.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Price:</span> KSH {spot.price}</p>
                  {spot.total > 0 && (
                    <p>
                      <span className="font-medium">Capacity:</span> {spot.available}/{spot.total}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEditSpot(spot)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSpot(spot.id, spot.image)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Edit Parking Spot</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingSpot(null);
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateSpot} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spot Name *
                </label>
                <input
                  type="text"
                  value={editingSpot.name}
                  onChange={(e) => setEditingSpot({...editingSpot, name: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={editingSpot.location}
                  onChange={(e) => setEditingSpot({...editingSpot, location: e.target.value})}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (KSH) *
                  </label>
                  <input
                    type="number"
                    value={editingSpot.price}
                    onChange={(e) => setEditingSpot({...editingSpot, price: e.target.value})}
                    min="1"
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={editingSpot.status}
                    onChange={(e) => setEditingSpot({...editingSpot, status: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="booked">Booked</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Spots
                  </label>
                  <input
                    type="number"
                    value={editingSpot.available}
                    onChange={(e) => setEditingSpot({...editingSpot, available: e.target.value})}
                    min="0"
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Spots
                  </label>
                  <input
                    type="number"
                    value={editingSpot.total}
                    onChange={(e) => setEditingSpot({...editingSpot, total: e.target.value})}
                    min="0"
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {(imagePreview || editingSpot.imageUrl) && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview || editingSpot.imageUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSpot(null);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Spot"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;