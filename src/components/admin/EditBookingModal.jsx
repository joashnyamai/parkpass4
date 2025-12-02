/**
 * EDIT BOOKING MODAL COMPONENT
 * Modal for editing booking details with validation
 */

import { useState, useEffect } from 'react';
import { X, Loader2, Calendar, Clock, Car, CreditCard, MapPin, Save } from 'lucide-react';
import { format } from 'date-fns';

const EditBookingModal = ({ isOpen, onClose, booking, onSave, loading }) => {
  const [formData, setFormData] = useState({
    parkingSpaceName: '',
    vehicleNumber: '',
    startTime: '',
    endTime: '',
    totalPrice: '',
    status: 'active',
    paymentStatus: 'pending'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (booking) {
      const startDate = booking.startTime instanceof Date 
        ? booking.startTime 
        : booking.startTime?.toDate?.() || new Date();
      const endDate = booking.endTime instanceof Date 
        ? booking.endTime 
        : booking.endTime?.toDate?.() || new Date();

      setFormData({
        parkingSpaceName: booking.parkingSpaceName || '',
        vehicleNumber: booking.vehicleInfo?.vehicleNumber || booking.vehicleNumber || '',
        startTime: format(startDate, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        totalPrice: booking.totalPrice?.toString() || '',
        status: booking.status || 'active',
        paymentStatus: booking.paymentStatus || 'pending'
      });
      setErrors({});
    }
  }, [booking]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.parkingSpaceName.trim()) {
      newErrors.parkingSpaceName = 'Parking space name is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }
    
    if (!formData.totalPrice || parseFloat(formData.totalPrice) < 0) {
      newErrors.totalPrice = 'Valid price is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(booking.id, {
        parkingSpaceName: formData.parkingSpaceName.trim(),
        vehicleInfo: { vehicleNumber: formData.vehicleNumber.trim() },
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        totalPrice: parseFloat(formData.totalPrice),
        status: formData.status,
        paymentStatus: formData.paymentStatus
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all">
          {/* Header */}
          <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-200 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Edit Booking</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Booking ID (read-only) */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="font-mono text-sm text-gray-900">{booking?.id}</p>
            </div>

            {/* Parking Space Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Parking Space *
              </label>
              <input
                type="text"
                name="parkingSpaceName"
                value={formData.parkingSpaceName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.parkingSpaceName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter parking space name"
              />
              {errors.parkingSpaceName && (
                <p className="mt-1 text-sm text-red-500">{errors.parkingSpaceName}</p>
              )}
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Car className="w-4 h-4" />
                Vehicle Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter vehicle number"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-500">{errors.startTime}</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>
              )}
            </div>

            {/* Total Price */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4" />
                Total Price (KES) *
              </label>
              <input
                type="number"
                name="totalPrice"
                value={formData.totalPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.totalPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter total price"
              />
              {errors.totalPrice && (
                <p className="mt-1 text-sm text-red-500">{errors.totalPrice}</p>
              )}
            </div>

            {/* Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Booking Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Payment Status *
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;
