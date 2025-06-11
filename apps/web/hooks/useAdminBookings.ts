import { useState, useCallback } from 'react';
import {
  roomBookingApi,
  type RoomBookingResponse,
  type RoomBookingHandleDto,
} from '@/api/room-booking.api';
import { toast } from 'sonner';

export const useAdminBookings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const fetchBookings = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      status?: string;
      search?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);
        const response = await roomBookingApi.getRoomBookings(params);
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
    },
    []
  );

  const handleBooking = useCallback(
    async (bookingId: string, data: RoomBookingHandleDto) => {
      try {
        setLoading(true);
        setError(null);
        const booking = await roomBookingApi.handleBooking(bookingId, data);
        toast.success(`Booking ${data.status.toLowerCase()} successfully`);

        // Refresh bookings list
        await fetchBookings({
          page: pagination.page,
          limit: pagination.limit,
        });

        return booking;
      } catch (error: any) {
        const message =
          error?.response?.data?.message || 'Failed to handle booking';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetchBookings, pagination.page, pagination.limit]
  );

  return {
    loading,
    error,
    bookings,
    pagination,
    fetchBookings,
    handleBooking,
  };
};
