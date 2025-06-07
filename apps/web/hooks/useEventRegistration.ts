import { useState, useCallback, useEffect } from 'react';
import {
  Event,
  EventRegistration,
  EventRegistrationStatus,
} from '@/types/event.types';
import { eventApi } from '@/api/event.api';
import { toast } from 'sonner';
import { getAPIErrorMessage } from '@/utils/error';
import { useQueryClient } from '@tanstack/react-query';

export const useEventRegistration = (
  eventId: string,
  onSuccess?: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([fetchEventDetails(), fetchRegistrations()]);
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  // Fetch event details
  const fetchEventDetails = async () => {
    try {
      const data = await eventApi.getEvent(eventId);
      setEventDetails(data);
      return data;
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error(getAPIErrorMessage(error));
      return null;
    }
  };

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      const data = await eventApi.getEventRegistrations({ eventId });
      setRegistrations(data);
      return data;
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error(getAPIErrorMessage(error));
      return [];
    }
  };

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

      // Refresh local state
      await Promise.all([fetchEventDetails(), fetchRegistrations()]);

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

      // Refresh local state
      await Promise.all([fetchEventDetails(), fetchRegistrations()]);

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
