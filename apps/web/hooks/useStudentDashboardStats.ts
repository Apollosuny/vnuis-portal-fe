import { useQuery } from '@tanstack/react-query';
import {
  roomBookingApi,
  RoomBookingResponse,
  RoomBookingResponseWithPagination,
} from '@/api/room-booking.api';
import { eventApi } from '@/api/event.api';
import { getUserFormSubmissions } from '@/api/form-submission.api';
import { RoomBookingStatus } from '@/types/room.types';
import { DateTime } from 'luxon';
import { AdministrativeProceduresFormSubmission } from '@/types/form-submission.types';
import { Event, EventRegistration } from '@/types/event.types';
import { FormSubmissionStatus } from '@/types/enums';

interface EventRegistrationWithEvent extends EventRegistration {
  event: Event;
}

export const useStudentDashboardStats = () => {
  // Get form submissions stats with error handling
  const {
    data: formSubmissions,
    isLoading: isFormLoading,
    error: formError,
  } = useQuery<AdministrativeProceduresFormSubmission[]>({
    queryKey: ['formSubmissions', 'user'],
    queryFn: async () => {
      const submissions = await getUserFormSubmissions();
      return submissions;
    },
  });

  // Get room bookings stats with error handling
  const {
    data: roomBookings,
    isLoading: isBookingLoading,
    error: bookingError,
  } = useQuery<RoomBookingResponseWithPagination>({
    queryKey: ['roomBookings', 'my'],
    queryFn: async () => {
      const response = await roomBookingApi.getMyBookings();
      return response;
    },
  });

  // Get event registrations stats with error handling
  const {
    data: eventRegistrations,
    isLoading: isEventLoading,
    error: eventError,
  } = useQuery<EventRegistrationWithEvent[]>({
    queryKey: ['eventRegistrations', 'my'],
    queryFn: async () => {
      const registrations = await eventApi.getEventRegistrations();
      return registrations as EventRegistrationWithEvent[];
    },
  });

  // Process form submissions by month with improved handling of empty data
  const formSubmissionsByMonth =
    formSubmissions?.reduce((acc: Record<string, number>, submission) => {
      const month = DateTime.fromISO(submission.createdAt).toFormat('MMM');
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {}) || {};

  // Calculate room bookings by status with error checking
  const roomBookingsByStatus =
    roomBookings?.data?.reduce(
      (
        acc: Record<RoomBookingStatus, number>,
        booking: RoomBookingResponse
      ) => {
        // Convert string status to RoomBookingStatus enum
        const status = booking.status as RoomBookingStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<RoomBookingStatus, number>
    ) || {};

  // Calculate statistics with proper null checks
  const stats = {
    pendingForms:
      formSubmissions?.filter(
        (form) => form.status === FormSubmissionStatus.PENDING
      ).length ?? 0,
    completedForms:
      formSubmissions?.filter(
        (form) => form.status === FormSubmissionStatus.APPROVED
      ).length ?? 0,
    roomBookings: roomBookings?.data?.length ?? 0,
    upcomingEvents:
      eventRegistrations?.filter((reg) => {
        if (!reg.event?.startTime) return false;
        return (
          DateTime.fromISO(reg.event.startTime) > DateTime.now() &&
          reg.status === 'APPROVED'
        );
      }).length ?? 0,
  };

  // Handle loading and error states
  const isLoading = isFormLoading || isBookingLoading || isEventLoading;
  const error = formError || bookingError || eventError;

  return {
    stats,
    formSubmissionsByMonth,
    roomBookingsByStatus,
    isLoading,
    error,
  };
};
