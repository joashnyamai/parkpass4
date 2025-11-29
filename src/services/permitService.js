/**
 * DIGITAL PARKING PERMIT MODULE
 * Generates and manages digital parking permits
 */

import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Generate a unique permit ID
 */
const generatePermitId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `PERMIT-${timestamp}-${randomStr}`.toUpperCase();
};

/**
 * Generate QR code data for permit
 */
const generateQRCodeData = (permit) => {
  return JSON.stringify({
    permitId: permit.permitId,
    bookingId: permit.bookingId,
    userId: permit.userId,
    parkingSpaceName: permit.parkingSpaceName,
    validFrom: permit.validFrom,
    validUntil: permit.validUntil,
    vehicleInfo: permit.vehicleInfo
  });
};

/**
 * Generate digital parking permit
 * 
 * @param {Object} bookingData - Booking information
 * @returns {Object} Digital permit object
 */
export const generateParkingPermit = async (bookingData) => {
  const {
    bookingId,
    userId,
    userEmail,
    parkingSpaceId,
    parkingSpaceName,
    startTime,
    endTime,
    vehicleInfo,
    totalPrice
  } = bookingData;

  const permit = {
    permitId: generatePermitId(),
    bookingId,
    userId,
    userEmail,
    parkingSpaceId,
    parkingSpaceName,
    vehicleInfo: vehicleInfo || 'Not specified',
    validFrom: startTime,
    validUntil: endTime,
    totalPrice,
    status: 'active',
    generatedAt: new Date().toISOString(),
    qrCodeData: null
  };

  // Generate QR code data
  permit.qrCodeData = generateQRCodeData(permit);

  try {
    // Update booking with permit information
    await updateDoc(doc(db, 'ParkingHistory', bookingId), {
      permitGenerated: true,
      permitId: permit.permitId,
      permitQRCode: permit.qrCodeData,
      updatedAt: serverTimestamp()
    });

    return permit;
  } catch (error) {
    console.error('Error generating parking permit:', error);
    throw new Error(`Failed to generate permit: ${error.message}`);
  }
};

/**
 * Validate parking permit
 * 
 * @param {string} permitId - Permit ID to validate
 * @param {Object} permitData - Permit data from QR code
 * @returns {Object} Validation result
 */
export const validatePermit = (permitId, permitData) => {
  try {
    const currentTime = new Date();
    const validFrom = new Date(permitData.validFrom);
    const validUntil = new Date(permitData.validUntil);

    const isValid = 
      permitData.permitId === permitId &&
      currentTime >= validFrom &&
      currentTime <= validUntil &&
      permitData.status === 'active';

    return {
      isValid,
      message: isValid 
        ? 'Permit is valid' 
        : 'Permit is invalid or expired',
      permitData: isValid ? permitData : null
    };
  } catch (error) {
    return {
      isValid: false,
      message: 'Invalid permit format',
      permitData: null
    };
  }
};

/**
 * Revoke parking permit
 * 
 * @param {string} bookingId - Booking ID
 * @returns {boolean} Success status
 */
export const revokePermit = async (bookingId) => {
  try {
    await updateDoc(doc(db, 'ParkingHistory', bookingId), {
      permitGenerated: false,
      permitId: null,
      permitQRCode: null,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error revoking permit:', error);
    throw new Error(`Failed to revoke permit: ${error.message}`);
  }
};

/**
 * Format permit for display
 * 
 * @param {Object} permit - Permit object
 * @returns {Object} Formatted permit data
 */
export const formatPermitForDisplay = (permit) => {
  return {
    ...permit,
    validFromFormatted: new Date(permit.validFrom).toLocaleString(),
    validUntilFormatted: new Date(permit.validUntil).toLocaleString(),
    generatedAtFormatted: new Date(permit.generatedAt).toLocaleString(),
    duration: calculateDuration(permit.validFrom, permit.validUntil)
  };
};

/**
 * Calculate duration between two dates
 */
const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHours}h ${diffMinutes}m`;
};
