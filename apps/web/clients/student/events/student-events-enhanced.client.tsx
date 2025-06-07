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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';

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
  const [activeTab, setActiveTab] = useState('upcoming');
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

  const upcomingEvents = events.filter((event) => !isEventPast(event));
  const pastEvents = events.filter((event) => isEventPast(event));

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <Tabs
        defaultValue='upcoming'
        onValueChange={setActiveTab}
        className='w-full'
      >
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold'>Event Registration</h1>
          <TabsList className='grid w-[400px] grid-cols-2'>
            <TabsTrigger value='upcoming' className='text-sm'>
              Upcoming Events ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value='past' className='text-sm'>
              Past Events ({pastEvents.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {loading ? (
          <div className='flex justify-center items-center min-h-[40vh]'>
            <Spinner size='lg' />
          </div>
        ) : (
          <>
            <TabsContent
              value='upcoming'
              className='mt-0 space-y-4 animate-in slide-in-from-right duration-500 ease-out'
            >
              {upcomingEvents.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-sm border border-gray-100'>
                  <div className='mb-6 bg-primary/10 p-4 rounded-full'>
                    <Calendar className='h-12 w-12 text-primary' />
                  </div>
                  <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                    No Upcoming Events
                  </h3>
                  <p className='text-gray-500 text-center max-w-md mb-6'>
                    There are no events scheduled at this time. Check back later
                    for exciting new opportunities!
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
                  {upcomingEvents.map((event) => {
                    const registration = getRegistration(event.id);
                    const canRegister =
                      !registration && isRegistrationOpen(event);

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
            </TabsContent>

            <TabsContent
              value='past'
              className='mt-0 space-y-4 animate-in slide-in-from-right duration-500 ease-out'
            >
              {pastEvents.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-sm border border-gray-100'>
                  <div className='mb-5 bg-gray-100 p-3 rounded-full'>
                    <Clock className='h-10 w-10 text-gray-500' />
                  </div>
                  <h3 className='text-lg font-medium text-gray-700 mb-2'>
                    No Past Events
                  </h3>
                  <p className='text-gray-500 text-center max-w-md'>
                    You haven't attended any events yet. Check out our upcoming
                    events to start your journey!
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {pastEvents.map((event) => {
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
            </TabsContent>
          </>
        )}
      </Tabs>
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
  const router = useRouter();
  const { isLoading, handleRegister, handleCancel, getRemainingSpots } =
    useEnhancedEventRegistration(event.id, onSuccess);

  // Calculate remaining spots and status outside of conditional logic
  const remainingSpots = getRemainingSpots();
  const isFull = event.capacity && remainingSpots === 0;
  const registrationClosed = !canRegister && !registration;

  const getRegistrationBadgeVariant = (status: EventRegistrationStatus) => {
    switch (status) {
      case EventRegistrationStatus.APPROVED:
        return 'default' as const;
      case EventRegistrationStatus.REJECTED:
        return 'destructive' as const;
      case EventRegistrationStatus.CANCELLED:
        return 'outline' as const;
      case EventRegistrationStatus.ATTENDED:
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Card
      className='flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer'
      onClick={() => router.push(`/student-dashboard/events/${event.id}`)}
    >
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span className='truncate flex-1'>{event.name}</span>
          {event.category && (
            <Badge variant='outline' className='ml-2 shrink-0'>
              {event.category}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className='flex-1 space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 text-gray-500' />
            <span>
              {DateTime.fromISO(event.startTime).toFormat('EEEE, MMMM d, yyyy')}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <Clock className='h-4 w-4 text-gray-500' />
            <span>
              {DateTime.fromISO(event.startTime).toFormat('h:mm a')} -{' '}
              {DateTime.fromISO(event.endTime).toFormat('h:mm a')}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <MapPin className='h-4 w-4 text-gray-500' />
            <span>{event.location}</span>
          </div>

          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-gray-500' />
              <span>
                {remainingSpots} / {event.capacity} spots left
              </span>
            </div>
          </div>
        </div>

        {registration && (
          <div className='mt-2'>
            <Badge
              variant={getRegistrationBadgeVariant(registration.status)}
              className='w-full flex items-center justify-center'
            >
              <FileCheck className='h-3 w-3 mr-1' />
              Status: {registration.status}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
