/**
 * ADMIN BOOKINGS COMPONENT
 * Real-time booking management with edit and delete functionality
 */

import { useState, useEffect } from 'react';
import { 
  Calendar, Search, Edit2, Trash2, RefreshCw, 
  Clock, Car, CreditCard, MapPin, User,
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { getBookingsRealTime, updateBooking, deleteBooking } from '../../services/adminService';
import EditBookingModal from './EditBookingModal';
import ConfirmDialog from './ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { showToast } = useToast();

  // Real-time bookings subscription
  useEffect(() => {
    const unsubscribe = getBookingsRealTime(
      (data) => {
        setBookings(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching bookings:', error);
        showToast('Failed to load bookings', 'error');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter bookings
  useEffect(() => {
    let filtered = [...bookings];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.parkingSpaceName?.toLowerCase().includes(term) ||
        booking.userEmail?.toLowerCase().includes(term) ||
        booking.vehicleInfo?.vehicleNumber?.toLowerCase().includes(term) ||
        booking.id?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }
    
    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === paymentFilter);
    }
    
    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [bookings, searchTerm, statusFilter, paymentFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  // Calculate stats
  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    revenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  };

  // Handlers
  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setEditModalOpen(true);
  };

  const handleDelete = (booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleSaveBooking = async (bookingId, data) => {
    setActionLoading(true);
    try {
      await updateBooking(bookingId, data);
      showToast('Booking updated successfully', 'success');
      setEditModalOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      showToast(error.message || 'Failed to update booking', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedBooking) return;
    
    setActionLoading(true);
    try {
      await deleteBooking(selectedBooking.id);
      showToast('Booking deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      showToast(error.message || 'Failed to delete booking', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Loading bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-soft">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-soft">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-soft">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-soft">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">KES {stats.revenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Booking Management</h2>
                <p className="text-sm text-gray-600">{bookings.length} total bookings</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
              
              {/* Payment Filter */}
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Booking</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                      ? 'No bookings match your filters' 
                      : 'No bookings found'}
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-gray-900">{booking.parkingSpaceName || 'N/A'}</span>
                        </div>
                        {booking.vehicleInfo?.vehicleNumber && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Car className="w-4 h-4" />
                            {booking.vehicleInfo.vehicleNumber}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 font-mono">{booking.id.slice(0, 12)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        {booking.userEmail || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {booking.startTime 
                            ? format(booking.startTime, 'MMM dd, HH:mm')
                            : 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <span className="w-4 text-center">→</span>
                          {booking.endTime 
                            ? format(booking.endTime, 'MMM dd, HH:mm')
                            : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                          {booking.status || 'unknown'}
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPaymentBadge(booking.paymentStatus)}`}>
                          <CreditCard className="w-3 h-3 inline mr-1" />
                          {booking.paymentStatus || 'pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-lg font-bold text-green-600">
                        KES {(booking.totalPrice || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Booking"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(booking)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Booking"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditBookingModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        onSave={handleSaveBooking}
        loading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Booking"
        message={`Are you sure you want to delete this booking for "${selectedBooking?.parkingSpaceName}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
};

export default AdminBookings;
