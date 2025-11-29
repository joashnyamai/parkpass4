/**
 * CUSTOM HOOK FOR REAL-TIME BOOKINGS
 * Provides real-time booking updates using onSnapshot
 */

import { useState, useEffect } from 'react';
import { watchUserBookings } from '../services/bookingService';
import { useAuth } from '../contexts/AuthContext';

export const useRealTimeBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = watchUserBookings(user.uid, (updatedBookings) => {
      setBookings(updatedBookings);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [user]);

  return { bookings, loading, error };
};
