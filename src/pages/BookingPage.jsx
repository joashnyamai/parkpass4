/**
 * BOOKING PAGE - Complete Flow
 * Handles: Space selection → Time selection → Payment → Receipt with QR Code
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getParkingSpace } from '../services/parkingService';
import { createBooking } from '../services/bookingService';
import { generateParkingPermit } from '../services/permitService';
import { Calendar, Clock, CreditCard, MapPin, Car, CheckCircle, Download } from 'lucide-react';
import PermitDisplay from '../components/PermitDisplay';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Receipt
  const [parkingSpace, setParkingSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Booking form data
  const [bookingData, setBookingData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    vehicleNumber: '',
    vehicleModel: ''
  });

  // Payment data
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Receipt data
  const [permit, setPermit] = useState(null);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (id) {
      console.log('✅ Parking space ID found:', id);
      loadParkingSpace();
    } else {
      console.log('⚠️ No parking space ID provided');
      setError('No parking space selected');
      setLoading(false);
    }
  }, [id, user, navigate]);

  const loadParkingSpace = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading parking space with ID:', id);
      const space = await getParkingSpace(id);
      console.log('📦 Parking space data:', space);
      if (!space) {
        setError('Parking space not found');
        return;
      }
      setParkingSpace(space);
    } catch (err) {
      setError(`Failed to load parking space: ${err.message}`);
      console.error('❌ Error loading parking space:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!bookingData.startDate || !bookingData.endDate || !parkingSpace) {
      return 0;
    }

    const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
    const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    
    return hours * parkingSpace.price;
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!bookingData.startDate || !bookingData.startTime || !bookingData.endDate || !bookingData.endTime) {
      setError('Please fill in all date and time fields');
      return;
    }

    const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
    const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);

    if (end <= start) {
      setError('End time must be after start time');
      return;
    }

    if (start < new Date()) {
      setError('Start time cannot be in the past');
      return;
    }

    setError(null);
    setStep(2); // Move to payment
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
      const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
      const totalPrice = calculatePrice();

      console.log('✅ Payment successful:', paymentResult);

      // Generate permit after successful payment
      const permitData = await generateParkingPermit({
        bookingId: bookingId,
        userId: user.uid,
        userEmail: user.email,
        parkingSpaceId: parkingSpace.id,
        parkingSpaceName: parkingSpace.name,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        vehicleInfo: `${bookingData.vehicleNumber} - ${bookingData.vehicleModel}`,
        totalPrice,
        paymentMethod: 'stripe',
        paymentReference: paymentResult.paymentMethodId
      });

      setPermit(permitData);
      setStep(3); // Move to receipt
    } catch (err) {
      console.error('Error generating permit:', err);
      setError('Payment successful but permit generation failed. Please contact support.');
    }
  };

  const handlePaymentError = (error) => {
    setError(error.message || 'Payment failed. Please try again.');
    setProcessing(false);
  };

  const handleProceedToPayment = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Create booking first
      const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
      const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
      const totalPrice = calculatePrice();

      const newBookingId = await createBooking({
        parkingSpaceId: parkingSpace.id,
        parkingSpaceName: parkingSpace.name,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        totalPrice,
        vehicleInfo: `${bookingData.vehicleNumber} - ${bookingData.vehicleModel}`
      });

      setBookingId(newBookingId);
      setStep(2); // Move to payment step
    } catch (err) {
      setError(err.message || 'Failed to create booking. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parking space...</p>
          <p className="mt-2 text-sm text-gray-500">ID: {id || 'No ID provided'}</p>
        </div>
      </div>
    );
  }

  if (error && !parkingSpace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Parking Space</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="text-left bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2"><strong>Debug Info:</strong></p>
              <p className="text-xs text-gray-500">Parking Space ID: {id || 'Not provided'}</p>
              <p className="text-xs text-gray-500">User: {user?.email || 'Not logged in'}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Back to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-24 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Details</span>
            <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Payment</span>
            <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>Receipt</span>
          </div>
        </div>

        {/* Step 1: Booking Details */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Book Parking Space</h2>

            {/* Parking Space Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{parkingSpace.name}</h3>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                {parkingSpace.location}
              </div>
              <div className="text-blue-600 font-bold">
                KES {parkingSpace.price}/hour
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Date and Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                    min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    End Time
                  </label>
                  <input
                    type="time"
                    value={bookingData.endTime}
                    onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Car className="w-4 h-4 inline mr-1" />
                    Vehicle Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., KAA 123B"
                    value={bookingData.vehicleNumber}
                    onChange={(e) => setBookingData({...bookingData, vehicleNumber: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Toyota Corolla"
                    value={bookingData.vehicleModel}
                    onChange={(e) => setBookingData({...bookingData, vehicleModel: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              {/* Price Summary */}
              {bookingData.startDate && bookingData.endDate && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      KES {calculatePrice()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  disabled={processing}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {processing ? 'Creating Booking...' : 'Proceed to Payment →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">💳 Secure Payment</h2>

            {/* Booking Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Parking Space:</span>
                  <span className="font-medium">{parkingSpace.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium">{bookingData.vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {bookingData.startDate} {bookingData.startTime} - {bookingData.endDate} {bookingData.endTime}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-blue-600">KES {calculatePrice()}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Stripe Payment Form */}
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                amount={calculatePrice()}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                bookingData={{
                  ...bookingData,
                  userEmail: user.email,
                  parkingSpaceName: parkingSpace.name
                }}
              />
            </Elements>

            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={processing}
              className="mt-4 w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              ← Back to Details
            </button>
          </div>
        )}

        {/* Step 3: Receipt with QR Code */}
        {step === 3 && permit && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="text-gray-600 mt-2">Your parking space has been booked</p>
            </div>

            {/* Permit Display */}
            <PermitDisplay permit={permit} />

            {/* Actions */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Receipt
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                View My Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
