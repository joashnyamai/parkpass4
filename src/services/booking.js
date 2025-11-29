// src/services/booking.js
import { db, auth } from "../firebase";
import {
  doc,
  collection,
  addDoc,
  runTransaction,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  getDoc
} from "firebase/firestore";

/**
 * Watch all parking slots in real time
 */
export function watchSlots(callback) {
  const q = collection(db, "parking_slots");
  return onSnapshot(q, (snap) => {
    const slots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(slots);
  });
}

/**
 * Atomic booking:
 * - Ensure slot is available
 * - Create booking doc (paymentStatus: 'pending')
 * - Mark slot as 'reserved' and set reservedUntil
 */
export async function createBookingAtomic({ slotId, slotName, startTimeISO, endTimeISO, amount }) {
  console.log('Starting booking process for slot:', { slotId, slotName, startTimeISO, endTimeISO, amount });
  
  const user = auth.currentUser;
  if (!user) {
    console.error('User not authenticated');
    throw new Error("Please log in to book a parking slot");
  }

  // Validate input
  if (!slotId || !startTimeISO || !endTimeISO) {
    throw new Error("Missing required booking information");
  }

  const startTime = new Date(startTimeISO);
  const endTime = new Date(endTimeISO);
  
  if (isNaN(startTime) || isNaN(endTime)) {
    throw new Error("Invalid date format");
  }
  
  if (endTime <= startTime) {
    throw new Error("End time must be after start time");
  }

  const slotRef = doc(db, "parking_slots", slotId);
  const bookingsRef = collection(db, "bookings");

  try {
    const bookingId = await runTransaction(db, async (tx) => {
      console.log('Transaction started for slot:', slotId);
      const slotSnap = await tx.get(slotRef);
      
      if (!slotSnap.exists()) {
        console.error('Slot not found:', slotId);
        throw new Error("Parking slot not found");
      }
      
      const slot = slotSnap.data();
      console.log('Current slot status:', slot.status);

      // Check if slot is available
      if (slot.status === "booked" || slot.status === "reserved") {
        console.error('Slot not available:', { slotId, status: slot.status });
        throw new Error("This parking slot is no longer available");
      }

      const bookingDocRef = doc(bookingsRef); // new auto-id
      const bookingData = {
        userId: user.uid,
        userEmail: user.email || null,
        slotId,
        slotName,
        startTime: startTimeISO,
        endTime: endTimeISO,
        amount,
        paymentStatus: "pending",
        paystackRef: null,
        createdAt: serverTimestamp(),
        reservedUntil: endTimeISO
      };

      tx.set(bookingDocRef, bookingData);

      tx.update(slotRef, {
        status: "reserved",
        currentBookingId: bookingDocRef.id,
        reservedUntil: endTimeISO
      });

      console.log('Booking created successfully:', bookingDocRef.id);
      return bookingDocRef.id;
    });

    return bookingId;
  } catch (error) {
    console.error('Error in createBookingAtomic:', error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Watch bookings for a user in real-time
 */
export function watchUserBookings(userId, callback) {
  const q = query(collection(db, "bookings"), where("userId", "==", userId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(bookings);
  });
}

/**
 * Admin: watch all bookings
 */
export function watchAllBookings(callback) {
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/**
 * Release slot helper
 */
export async function releaseSlot(slotId) {
  const slotRef = doc(db, "parking_slots", slotId);
  await updateDoc(slotRef, {
    status: "available",
    currentBookingId: null,
    reservedUntil: null
  });
}
