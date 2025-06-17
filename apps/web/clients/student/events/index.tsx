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
import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import { EventCard } from './event-card';
import { useUserStore } from '@/stores/user.store';

export const StudentEventsClient = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('upcoming');

  const { user, student } = useUserStore();

  // Convert to useQuery
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () =>
      await eventApi.getEventsByStudent({
        include: ['registrations'],
      }),
  });

  const isEventPast = (event: Event) => {
    return DateTime.fromISO(event.endTime) < DateTime.now();
  };

  if (eventsLoading) {
    return <Spinner />;
  }

  const upcomingEvents = events.filter((event: Event) => !isEventPast(event));
  const pastEvents = events.filter((event: Event) => isEventPast(event));

  return (
    <div className='space-y-6'>
      {/* <div>
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
      </div> */}
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

        {false ? (
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
                    onClick={() => {}}
                  >
                    Refresh Events
                  </Button>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {upcomingEvents.map((event: Event) => {
                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        registration={event.registrations?.find(
                          (register) => register.studentId === student?.id
                        )}
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
                  {pastEvents.map((event: Event) => {
                    return (
                      <EventCard
                        key={event.id}
                        event={event}
                        // registration={registration}
                        // isPast={true}
                        // onSuccess={() => {
                        //   fetchMyRegistrations();
                        // }}
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
