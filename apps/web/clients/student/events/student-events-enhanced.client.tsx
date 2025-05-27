'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Event,
  EventRegistration,
  EventRegistrationStatus,
} from '@/types/event.types';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { getAPIErrorMessage } from '@/utils/error';
import { DateTime } from 'luxon';
import { Calendar, Clock, MapPin, Users, FileCheck } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
// Import mock data
import { mockEvents, mockRegistrations } from './mock-events';

// Mock version of useEventRegistration hook for local testing
const useMockEventRegistration = (eventId: string, onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  // Check if event is full by counting registrations
  const isEventFull = (eventId: string) => {
    const event = mockEvents.find((e) => e.id === eventId);
    if (!event) return false;

    const approvedRegistrations = mockRegistrations.filter(
      (reg) =>
        reg.eventId === eventId &&
        (reg.status === EventRegistrationStatus.APPROVED ||
          reg.status === EventRegistrationStatus.ATTENDED)
    );

    return approvedRegistrations.length >= event.capacity;
  };

  // Get remaining spots for an event
  const getRemainingSpots = (eventId: string) => {
    const event = mockEvents.find((e) => e.id === eventId);
    if (!event) return 0;

    const approvedRegistrations = mockRegistrations.filter(
      (reg) =>
        reg.eventId === eventId &&
        (reg.status === EventRegistrationStatus.APPROVED ||
          reg.status === EventRegistrationStatus.ATTENDED)
    );

    return Math.max(0, event.capacity - approvedRegistrations.length);
  };

  const handleRegister = async (additionalInfo?: Record<string, any>) => {
    try {
      setIsLoading(true);

      // Check if event is full
      if (isEventFull(eventId)) {
        toast.error('This event has reached maximum capacity.');
        setIsLoading(false);
        return;
      }

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create a new mock registration
      const newRegistration = {
        id: `reg-${Math.random().toString(36).substring(2, 9)}`,
        eventId,
        status: EventRegistrationStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        studentId: 'current-user',
        additionalInfo,
      };

      // Add to mockRegistrations (this is just for the current session)
      mockRegistrations.push(newRegistration as any);

      toast.success('Event registration successful');
      onSuccess?.();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (registrationId: string) => {
    try {
      setIsLoading(true);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find and update the registration status
      const regIndex = mockRegistrations.findIndex(
        (reg) => reg.id === registrationId
      );
      if (regIndex >= 0) {
        const registration = mockRegistrations[regIndex];
        if (registration) {
          registration.status = EventRegistrationStatus.CANCELLED;
          registration.updatedAt = new Date().toISOString();
        }
      }

      toast.success('Registration cancelled successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleRegister,
    handleCancel,
    getRemainingSpots,
    isEventFull,
  };
};

export const StudentEventsClient = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRegistrations, setMyRegistrations] = useState<
    Record<string, EventRegistration>
  >({});

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      setTimeout(() => {
        setEvents(mockEvents);
        setLoading(false);
      }, 1000); // Simulate network delay
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      // Filter registrations for current user (assuming studentId = 'current-user')
      const myRegs = mockRegistrations.filter(
        (reg) => reg.studentId === 'current-user'
      );

      // Convert to a lookup object by eventId
      const registrationsMap = myRegs.reduce(
        (acc: Record<string, EventRegistration>, item: EventRegistration) => {
          acc[item.eventId] = item;
          return acc;
        },
        {}
      );
      setMyRegistrations(registrationsMap);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    }
  };

  // Check if event is in the past
  const isEventPast = (event: Event) => {
    return DateTime.fromISO(event.endTime) < DateTime.now();
  };

  // Check if registration is still open
  const isRegistrationOpen = (event: Event) => {
    if (event.registrationDeadline) {
      return DateTime.fromISO(event.registrationDeadline) > DateTime.now();
    }
    return DateTime.fromISO(event.startTime) > DateTime.now();
  };

  // Get registration for event
  const getRegistration = (eventId: string) => {
    return myRegistrations[eventId];
  };

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div>
        <h1 className='text-2xl font-bold mb-4'>Upcoming Events</h1>

        {loading ? (
          <div className='flex justify-center items-center min-h-[40vh]'>
            <Spinner size='lg' />
          </div>
        ) : events.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>
            No upcoming events at this time. Check back soon!
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {events
              .filter((event) => !isEventPast(event))
              .map((event) => {
                const registration = getRegistration(event.id);
                const canRegister = !registration && isRegistrationOpen(event);

                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    registration={registration}
                    canRegister={canRegister}
                    onSuccess={() => {
                      fetchMyRegistrations();
                    }}
                  />
                );
              })}
          </div>
        )}
      </div>

      <div>
        <h2 className='text-xl font-bold mb-4'>Past Events</h2>

        {loading ? (
          <div className='flex justify-center items-center h-20'>
            <Spinner size='md' />
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {events
              .filter((event) => isEventPast(event))
              .map((event) => {
                const registration = getRegistration(event.id);

                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    registration={registration}
                    isPast={true}
                    onSuccess={() => {
                      fetchMyRegistrations();
                    }}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

type EventCardProps = {
  event: Event;
  registration?: EventRegistration;
  canRegister?: boolean;
  isPast?: boolean;
  onSuccess?: () => void;
};

const EventCard = ({
  event,
  registration,
  canRegister,
  isPast,
  onSuccess,
}: EventCardProps) => {
  // Using a mock version of the registration hook for the local implementation
  const { isLoading, handleRegister, handleCancel, getRemainingSpots } =
    useMockEventRegistration(event.id, onSuccess);

  const remainingSpots = getRemainingSpots(event.id);
  const isFull = remainingSpots === 0;
  const isLimitedSpots = remainingSpots <= 5;

  const getRegistrationBadge = () => {
    if (!registration) return null;

    let variant = 'secondary';
    switch (registration.status) {
      case 'APPROVED':
        variant = 'success';
        break;
      case 'REJECTED':
        variant = 'destructive';
        break;
      case 'CANCELLED':
        variant = 'outline';
        break;
      case 'ATTENDED':
        variant = 'default';
        break;
    }

    return (
      <Badge variant={variant as any} className='ml-2'>
        {registration.status}
      </Badge>
    );
  };

  // Show rejection message if applicable
  const getRejectionMessage = () => {
    if (registration?.status === 'REJECTED' && registration.remarks) {
      return (
        <div className='mt-2 text-sm text-red-500 p-2 bg-red-50 rounded-md'>
          Reason: {registration.remarks}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={isPast ? 'opacity-80' : ''}>
      {event.imageUrl && (
        <div className='aspect-video w-full overflow-hidden rounded-t-lg'>
          <img
            src={event.imageUrl}
            alt={event.name}
            className='h-full w-full object-cover'
          />
        </div>
      )}

      <CardHeader className='pb-2'>
        <div className='flex justify-between items-start gap-2'>
          <CardTitle className='text-lg line-clamp-2'>{event.name}</CardTitle>
          {getRegistrationBadge()}
        </div>
        {event.category && (
          <Badge variant='outline' className='mt-1'>
            {event.category}
          </Badge>
        )}
      </CardHeader>

      <CardContent className='space-y-3'>
        <div className='flex items-center gap-2 text-sm'>
          <Calendar className='h-4 w-4 text-gray-500' />
          <span>
            {DateTime.fromISO(event.startTime).toFormat('EEEE, MMMM d, yyyy')}
          </span>
        </div>

        <div className='flex items-center gap-2 text-sm'>
          <Clock className='h-4 w-4 text-gray-500' />
          <span>
            {DateTime.fromISO(event.startTime).toFormat('h:mm a')} -{' '}
            {DateTime.fromISO(event.endTime).toFormat('h:mm a')}
          </span>
        </div>

        <div className='flex items-center gap-2 text-sm'>
          <MapPin className='h-4 w-4 text-gray-500' />
          <span>{event.location}</span>
        </div>

        <div className='flex items-center gap-2 text-sm'>
          <Users className='h-4 w-4 text-gray-500' />
          <span>
            {event.capacity} attendees
            {!isPast && isLimitedSpots && (
              <span
                className={
                  isFull
                    ? 'text-red-500 ml-1 font-semibold'
                    : 'text-amber-500 ml-1 font-semibold'
                }
              >
                ({isFull ? 'Full' : `${remainingSpots} spots left`})
              </span>
            )}
          </span>
        </div>

        {event.registrationDeadline && (
          <div className='flex items-center gap-2 text-sm'>
            <FileCheck className='h-4 w-4 text-gray-500' />
            <span>
              Register by{' '}
              {DateTime.fromISO(event.registrationDeadline).toFormat(
                'MMM d, h:mm a'
              )}
            </span>
          </div>
        )}

        <p className='line-clamp-2 text-sm text-gray-600 pt-1'>
          {event.description}
        </p>

        {/* Show rejection message if applicable */}
        {getRejectionMessage()}

        <div className='pt-3 flex justify-between items-center'>
          {!isPast && (
            <div>
              {canRegister ? (
                <Button
                  disabled={isLoading || isFull}
                  // loading={isLoading}
                  onClick={() => handleRegister()}
                >
                  {isFull ? 'Event Full' : 'Register'}
                </Button>
              ) : (
                registration &&
                registration.status !== 'CANCELLED' && (
                  <Button
                    variant='outline'
                    disabled={isLoading}
                    // loading={isLoading}
                    onClick={() => handleCancel(registration.id)}
                  >
                    Cancel Registration
                  </Button>
                )
              )}
            </div>
          )}

          <Button variant='ghost' className='text-sm' onClick={() => {}}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
