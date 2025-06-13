import { useState, useCallback, useEffect } from 'react';
import {
  Event,
  EventRegistration,
  EventRegistrationStatus,
} from '@/types/event.types';
import { eventApi } from '@/api/event.api';
import { toast } from 'sonner';
import { getAPIErrorMessage } from '@/utils/error';
import { useQueryClient, useQuery } from '@tanstack/react-query';

export const useEventRegistration = (
  eventId: string,
  onSuccess?: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  // Fetch event details using React Query
  const { data: eventData, isLoading: isEventLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      return await eventApi.getEvent(eventId);
    },
    enabled: !!eventId,
  });

  // Fetch registrations using React Query
  const { data: registrationsData, isLoading: isRegistrationsLoading } =
    useQuery({
      queryKey: ['eventRegistrations', eventId],
      queryFn: async () => {
        return await eventApi.getEventRegistrations({ eventId });
      },
      enabled: !!eventId,
    });

  // Update state based on query results
  useEffect(() => {
    if (eventData) {
      setEventDetails(eventData);
    }
  }, [eventData]);

  useEffect(() => {
    if (registrationsData) {
      setRegistrations(registrationsData);
    }
  }, [registrationsData]);

  // Update loading state based on queries
  useEffect(() => {
    setIsLoading(isEventLoading || isRegistrationsLoading);
  }, [isEventLoading, isRegistrationsLoading]);

  // Check registration availability
  const isEventFull = useCallback(() => {
    if (!eventDetails) return false;

    const approvedRegistrations = registrations.filter(
      (reg) =>
        reg.status === EventRegistrationStatus.APPROVED ||
        reg.status === EventRegistrationStatus.ATTENDED
    );

    return approvedRegistrations.length >= eventDetails.capacity;
  }, [eventDetails, registrations]);

  // Get remaining spots
  const getRemainingSpots = useCallback(() => {
    if (!eventDetails) return 0;

    const approvedRegistrations = registrations.filter(
      (reg) =>
        reg.status === EventRegistrationStatus.APPROVED ||
        reg.status === EventRegistrationStatus.ATTENDED
    );

    return Math.max(0, eventDetails.capacity - approvedRegistrations.length);
  }, [eventDetails, registrations]);

  // Register for event
  const handleRegister = async (additionalInfo?: Record<string, any>) => {
    try {
      setIsLoading(true);

      if (isEventFull()) {
        toast.error('This event has reached maximum capacity.');
        return;
      }

      await eventApi.registerEvent({
        eventId,
        additionalInfo,
      });

      toast.success('Event registration successful');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });

      onSuccess?.();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel registration
  const handleCancel = async (registrationId: string) => {
    try {
      setIsLoading(true);

      await eventApi.cancelRegistration(registrationId);

      toast.success('Registration cancelled successfully');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });

      onSuccess?.();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    eventDetails,
    registrations,
    getRemainingSpots,
    isEventFull,
    handleRegister,
    handleCancel,
  };
};
