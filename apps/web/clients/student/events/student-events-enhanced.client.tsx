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
import { eventApi } from '@/api/event.api';

// Enhanced version of useEventRegistration hook with capacity checking
// This combines real API calls with additional functionality
const useEnhancedEventRegistration = (
  eventId: string,
  onSuccess?: () => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);

  // Fetch event details and registrations on mount
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Fetch event details
        const event = await eventApi.getEvent(eventId);
        setEventDetails(event);

        // Fetch registrations for this event
        const regs = await eventApi.getEventRegistrations({ eventId });
        console.log(`Loaded ${regs.length} registrations for event ${eventId}`);
        setRegistrations(regs);
      } catch (error) {
        console.error('Error fetching event data:', error);
        toast.error(getAPIErrorMessage(error));
      }
    };

    fetchEventData();
  }, [eventId]);

  // Check if event is full by counting registrations
  const isEventFull = () => {
    if (!eventDetails) return false;

    const approvedRegistrations = registrations.filter(
      (reg) =>
        reg.status === EventRegistrationStatus.APPROVED ||
        reg.status === EventRegistrationStatus.ATTENDED
    );

    return approvedRegistrations.length >= eventDetails.capacity;
  };

  // Get remaining spots for an event
  const getRemainingSpots = () => {
    if (!eventDetails) return 0;

    const approvedRegistrations = registrations.filter(
      (reg) =>
        reg.status === EventRegistrationStatus.APPROVED ||
        reg.status === EventRegistrationStatus.ATTENDED
    );

    return Math.max(0, eventDetails.capacity - approvedRegistrations.length);
  };

  const handleRegister = async (additionalInfo?: Record<string, any>) => {
    try {
      setIsLoading(true);

      // Check if event is full
      if (isEventFull()) {
        toast.error('This event has reached maximum capacity.');
        return;
      }

      // Use the real API to register
      await eventApi.registerEvent({
        eventId,
        additionalInfo,
      });

      toast.success('Event registration successful');
      onSuccess?.();

      // Refresh registrations
      const regs = await eventApi.getEventRegistrations({ eventId });
      setRegistrations(regs);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(getAPIErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (registrationId: string) => {
    try {
      setIsLoading(true);

      // Use the real API to cancel registration
      await eventApi.cancelRegistration(registrationId);

      toast.success('Registration cancelled successfully');
      onSuccess?.();

      // Refresh registrations
      const regs = await eventApi.getEventRegistrations({ eventId });
      setRegistrations(regs);
    } catch (error) {
      console.error('Cancellation error:', error);
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
    eventDetails,
    registrations,
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
      const data = await eventApi.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error(getAPIErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const data = await eventApi.getEventRegistrations({});

      // Convert to a lookup object by eventId
      const registrationsMap = data.reduce(
        (acc: Record<string, EventRegistration>, item: EventRegistration) => {
          acc[item.eventId] = item;
          return acc;
        },
        {}
      );

      console.log('Registrations loaded:', data.length);
      setMyRegistrations(registrationsMap);
    } catch (error) {
      console.error('Failed to load registrations:', error);
      toast.error(getAPIErrorMessage(error));
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
          <div className='flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-sm border border-gray-100'>
            <div className='mb-6 bg-primary/10 p-4 rounded-full'>
              <Calendar className='h-12 w-12 text-primary' />
            </div>
            <h3 className='text-xl font-semibold text-gray-800 mb-2'>
              No Upcoming Events
            </h3>
            <p className='text-gray-500 text-center max-w-md mb-6'>
              There are no events scheduled at this time. Check back later for
              exciting new opportunities!
            </p>
            <Button
              variant='outline'
              className='border-dashed border-2 hover:bg-primary/5 transition-all'
              onClick={() => fetchEvents()}
            >
              Refresh Events
            </Button>
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
        ) : events.filter((event) => isEventPast(event)).length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-sm border border-gray-100'>
            <div className='mb-5 bg-gray-100 p-3 rounded-full'>
              <Clock className='h-10 w-10 text-gray-500' />
            </div>
            <h3 className='text-lg font-medium text-gray-700 mb-2'>
              No Past Events
            </h3>
            <p className='text-gray-500 text-center max-w-md'>
              You haven't attended any events yet. Check out our upcoming events
              to start your journey!
            </p>
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
  // Using the enhanced registration hook that combines API with additional functionality
  const { isLoading, handleRegister, handleCancel, getRemainingSpots } =
    useEnhancedEventRegistration(event.id, onSuccess);

  const remainingSpots = getRemainingSpots();
  const isFull =
    remainingSpots === 0 ||
    useEnhancedEventRegistration(event.id).isEventFull();
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
