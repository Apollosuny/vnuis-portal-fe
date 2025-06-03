'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { eventApi } from '@/api/event.api';
import { Event, EventRegistration } from '@/types/event.types';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { getAPIErrorMessage } from '@/utils/error';
import { DateTime } from 'luxon';
import { Calendar, Clock, MapPin, Users, FileCheck } from 'lucide-react';
import { useEventRegistration } from '@/hooks/useEvent';
import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { mockEvents, mockRegistrations } from './mock-events';

export const StudentEventsClient = () => {
  const router = useRouter();

  // Convert to useQuery
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        const data = await eventApi.getEvents();
        return data.map((event: Event) => ({
          ...event,
          requireApproval: event.requireApproval ?? true,
          category: event.category ?? 'General',
          metadata: event.metadata ?? {},
        }));
      } catch (error) {
        console.error('API call failed, using mock data instead:', error);
        toast.error(getAPIErrorMessage(error));
        return mockEvents;
      }
    },
  });

  const { data: eventRegistrations = {} } = useQuery({
    queryKey: ['eventRegistrations'],
    queryFn: async () => {
      try {
        const data = await eventApi.getEventRegistrations({});
        return data.reduce(
          (acc: Record<string, EventRegistration>, item: EventRegistration) => {
            acc[item.eventId] = item;
            return acc;
          },
          {}
        );
      } catch (error) {
        console.error('Failed to load registrations, using mock data:', error);
        const myRegs = mockRegistrations.filter(
          (reg) => reg.studentId === 'current-user'
        );
        return myRegs.reduce(
          (acc: Record<string, EventRegistration>, item: EventRegistration) => {
            acc[item.eventId] = item;
            return acc;
          },
          {}
        );
      }
    },
  });

  const isEventPast = (event: Event) => {
    return DateTime.fromISO(event.endTime) < DateTime.now();
  };

  const isRegistrationOpen = (event: Event) => {
    if (event.registrationDeadline) {
      return DateTime.fromISO(event.registrationDeadline) > DateTime.now();
    }
    return DateTime.fromISO(event.startTime) > DateTime.now();
  };

  if (eventsLoading) {
    return <Spinner />;
  }

  const upcomingEvents = events.filter((event: Event) => !isEventPast(event));
  const pastEvents = events.filter((event: Event) => isEventPast(event));

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-semibold'>Upcoming Events</h2>
        <div className='mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {upcomingEvents.map((event: Event) => {
            const registration = eventRegistrations[event.id];
            const canRegister = !registration && isRegistrationOpen(event);

            return (
              <Card key={event.id} className='flex flex-col justify-between'>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span>{event.name}</span>
                    <Badge
                      variant={
                        event.category === 'Workshop' ? 'default' : 'outline'
                      }
                    >
                      {event.category}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex-1'>
                  <div className='space-y-2'>
                    <div className='flex items-center text-sm'>
                      <Calendar className='mr-2 h-4 w-4' />
                      <span>
                        {DateTime.fromISO(event.startTime).toFormat(
                          'dd/MM/yyyy'
                        )}
                      </span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <Clock className='mr-2 h-4 w-4' />
                      <span>
                        {DateTime.fromISO(event.startTime).toFormat('HH:mm')} -{' '}
                        {DateTime.fromISO(event.endTime).toFormat('HH:mm')}
                      </span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <MapPin className='mr-2 h-4 w-4' />
                      <span>{event.location}</span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <Users className='mr-2 h-4 w-4' />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                    {registration && (
                      <div className='flex items-center text-sm'>
                        <FileCheck className='mr-2 h-4 w-4' />
                        <span>
                          Registration status:{' '}
                          <span className='font-medium text-green-600'>
                            {registration.status}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {!registration && (
                    <div className='mt-4'>
                      <Button
                        className='w-full'
                        disabled={!canRegister}
                        onClick={() => {
                          router.push(`/events/${event.id}/register`);
                        }}
                      >
                        {canRegister ? 'Register' : 'Registration Closed'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className='text-lg font-semibold'>Past Events</h2>
        <div className='mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {pastEvents.map((event: Event) => {
            const registration = eventRegistrations[event.id];

            return (
              <Card
                key={event.id}
                className='flex flex-col justify-between opacity-70'
              >
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span>{event.name}</span>
                    <Badge
                      variant={
                        event.category === 'Workshop' ? 'default' : 'outline'
                      }
                    >
                      {event.category}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex-1'>
                  <div className='space-y-2'>
                    <div className='flex items-center text-sm'>
                      <Calendar className='mr-2 h-4 w-4' />
                      <span>
                        {DateTime.fromISO(event.startTime).toFormat(
                          'dd/MM/yyyy'
                        )}
                      </span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <Clock className='mr-2 h-4 w-4' />
                      <span>
                        {DateTime.fromISO(event.startTime).toFormat('HH:mm')} -{' '}
                        {DateTime.fromISO(event.endTime).toFormat('HH:mm')}
                      </span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <MapPin className='mr-2 h-4 w-4' />
                      <span>{event.location}</span>
                    </div>
                    <div className='flex items-center text-sm'>
                      <Users className='mr-2 h-4 w-4' />
                      <span>Capacity: {event.capacity}</span>
                    </div>
                    {registration && (
                      <div className='flex items-center text-sm'>
                        <FileCheck className='mr-2 h-4 w-4' />
                        <span>
                          Status:{' '}
                          <span className='font-medium'>
                            {registration.status}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
