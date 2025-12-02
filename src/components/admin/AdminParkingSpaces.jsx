/**
 * ADMIN PARKING SPACES COMPONENT
 * Real-time parking space management with CRUD operations
 */

import { useState, useEffect } from 'react';
import { 
  ParkingSquare, Search, Edit2, Trash2, RefreshCw, 
  Plus, MapPin, DollarSign, X, Loader2, Save,
  ChevronLeft, ChevronRight, Image as ImageIcon
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { getParkingSpacesRealTime, updateParkingSpace, deleteParkingSpace } from '../../services/adminService';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';

const AdminParkingSpaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [filteredSpaces, setFilteredSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '', location: '', price: '', status: 'available',
    available: '', total: '', imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = getParkingSpacesRealTime(
      (data) => { setSpaces(data); setLoading(false); },
      (error) => { showToast('Failed to load parking spaces', 'error'); setLoading(false); }
    );
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    let filtered = [...spaces];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name?.toLowerCase().includes(term) || s.location?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    setFilteredSpaces(filtered);
    setCurrentPage(1);
  }, [spaces, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredSpaces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSpaces = filteredSpaces.slice(startIndex, startIndex + itemsPerPage);

  const resetForm = () => {
    setFormData({ name: '', location: '', price: '', status: 'available', available: '', total: '', imageUrl: '' });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { showToast('Image must be less than 5MB', 'error'); return; }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl || '';
    const storageRef = ref(storage, `parking_images/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    return await getDownloadURL(storageRef);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.price) {
      showToast('Please fill required fields', 'error'); return;
    }
    setActionLoading(true);
    try {
      const imageUrl = await uploadImage();
      await addDoc(collection(db, 'parking_slots'), {
        name: formData.name.trim(), location: formData.location.trim(),
        price: Number(formData.price), status: formData.status,
        available: Number(formData.available) || 0, availableSpots: Number(formData.available) || 0,
        total: Number(formData.total) || 0, totalSpots: Number(formData.total) || 0,
        image: imageUrl, imageUrl, features: ['Covered', '24/7', 'CCTV'],
        rating: 0, reviews: 0, totalReviews: 0,
        coordinates: { lat: -1.286389, lng: 36.817223 },
        createdAt: serverTimestamp()
      });
      showToast('Parking space added!', 'success');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      showToast(error.message || 'Failed to add', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (space) => {
    setSelectedSpace(space);
    setFormData({
      name: space.name || '', location: space.location || '',
      price: space.price?.toString() || '', status: space.status || 'available',
      available: (space.available || space.availableSpots || 0).toString(),
      total: (space.total || space.totalSpots || 0).toString(),
      imageUrl: space.image || space.imageUrl || ''
    });
    setImagePreview(space.image || space.imageUrl || null);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSpace) return;
    setActionLoading(true);
    try {
      const imageUrl = await uploadImage();
      await updateParkingSpace(selectedSpace.id, {
        name: formData.name.trim(), location: formData.location.trim(),
        price: Number(formData.price), status: formData.status,
        available: Number(formData.available) || 0, availableSpots: Number(formData.available) || 0,
        total: Number(formData.total) || 0, totalSpots: Number(formData.total) || 0,
        image: imageUrl, imageUrl
      });
      showToast('Parking space updated!', 'success');
      setShowEditModal(false);
      setSelectedSpace(null);
      resetForm();
    } catch (error) {
      showToast(error.message || 'Failed to update', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (space) => { setSelectedSpace(space); setDeleteDialogOpen(true); };

  const handleConfirmDelete = async () => {
    if (!selectedSpace) return;
    setActionLoading(true);
    try {
      await deleteParkingSpace(selectedSpace.id);
      showToast('Parking space deleted!', 'success');
      setDeleteDialogOpen(false);
      setSelectedSpace(null);
    } catch (error) {
      showToast(error.message || 'Failed to delete', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = { available: 'bg-green-100 text-green-800', reserved: 'bg-yellow-100 text-yellow-800', booked: 'bg-red-100 text-red-800' };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Loading parking spaces...</span>
        </div>
      </div>
    );
  }


  // Form Modal Component
  const FormModal = ({ isEdit, onSubmit, onClose }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b z-10">
            <h2 className="text-xl font-bold">{isEdit ? 'Edit' : 'Add'} Parking Space</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
          </div>
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (KES) *</label>
                <input type="number" min="1" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="booked">Booked</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Spots</label>
                <input type="number" min="0" value={formData.available} onChange={(e) => setFormData({...formData, available: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Spots</label>
                <input type="number" min="0" value={formData.total} onChange={(e) => setFormData({...formData, total: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
              {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-xl" />}
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} disabled={actionLoading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {actionLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />{isEdit ? 'Update' : 'Add'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-soft p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-xl"><ParkingSquare className="w-6 h-6 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Parking Spaces</h2>
              <p className="text-sm text-gray-600">{spaces.length} total spaces</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 w-full sm:w-64" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500">
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="booked">Booked</option>
            </select>
            <button onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium">
              <Plus className="w-5 h-5" />Add Space
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      {paginatedSpaces.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
          <ParkingSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{searchTerm || statusFilter !== 'all' ? 'No spaces match your filters' : 'No parking spaces yet'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedSpaces.map((space) => (
            <div key={space.id} className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-shadow">
              <img src={space.image || space.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'} alt={space.name}
                className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{space.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(space.status)}`}>{space.status}</span>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-2"><MapPin className="w-4 h-4" />{space.location}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-green-600">KES {space.price}</span>
                  <span className="text-sm text-gray-500">{space.available || space.availableSpots || 0}/{space.total || space.totalSpots || 0} spots</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(space)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-1">
                    <Edit2 className="w-4 h-4" />Edit
                  </button>
                  <button onClick={() => handleDelete(space)} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-1">
                    <Trash2 className="w-4 h-4" />Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
          <span className="px-4 py-2 text-sm font-medium">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <FormModal isEdit={false} onSubmit={handleAdd} onClose={() => { setShowAddModal(false); resetForm(); }} />}
      {showEditModal && <FormModal isEdit={true} onSubmit={handleUpdate} onClose={() => { setShowEditModal(false); setSelectedSpace(null); resetForm(); }} />}
      <ConfirmDialog isOpen={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setSelectedSpace(null); }}
        onConfirm={handleConfirmDelete} title="Delete Parking Space"
        message={`Delete "${selectedSpace?.name}"? This cannot be undone.`} confirmText="Delete" type="danger" loading={actionLoading} />
    </div>
  );
};

export default AdminParkingSpaces;
