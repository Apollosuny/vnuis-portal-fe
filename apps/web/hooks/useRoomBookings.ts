import { useState, useCallback } from 'react';
import {
  roomBookingApi,
  type RoomBookingResponse,
} from '@/api/room-booking.api';
import { toast } from 'sonner';
import type { RoomBookingStatus } from '@/types/room.types';

export const useRoomBookings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchMyBookings = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomBookingApi.getMyBookings(page, limit);
      setBookings(response.data);
      setPagination(response.meta);
      return response;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to fetch bookings';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(
    async (bookingData: {
      startTime: string;
      duration: number;
      purpose: string;
      isRecurring: boolean;
      roomId: string;
      offset: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        const booking = await roomBookingApi.createBooking(bookingData);
        toast.success('Room booked successfully!');
        return booking;
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to book room';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelBooking = useCallback(
    async (bookingId: string) => {
      try {
        setLoading(true);
        setError(null);
        const booking = await roomBookingApi.cancelBooking(bookingId);
        toast.success('Booking cancelled successfully');
        // Refresh the bookings list
        await fetchMyBookings();
        return booking;
      } catch (error: any) {
        const message =
          error?.response?.data?.message || 'Failed to cancel booking';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchMyBookings]
  );

  const updateBooking = useCallback(
    async (
      bookingId: string,
      data: {
        startTime?: string;
        duration?: number;
        purpose?: string;
        isRecurring?: boolean;
        attendees?: number;
        offset: string;
      }
    ) => {
      try {
        setLoading(true);
        setError(null);
        const booking = await roomBookingApi.updateBooking(bookingId, data);
        toast.success('Booking updated successfully');
        // Refresh the bookings list
        await fetchMyBookings();
        return booking;
      } catch (error: any) {
        const message =
          error?.response?.data?.message || 'Failed to update booking';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchMyBookings]
  );

  return {
    loading,
    error,
    bookings,
    pagination,
    fetchMyBookings,
    createBooking,
    cancelBooking,
    updateBooking,
  };
};
