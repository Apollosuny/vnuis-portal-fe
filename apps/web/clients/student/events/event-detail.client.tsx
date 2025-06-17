'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Event,
  EventRegistration,
  EventRegistrationStatus,
} from '@/types/event.types';
import { eventApi } from '@/api/event.api';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
import { getAPIErrorMessage } from '@/utils/error';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/stores/user.store';

type EventDetailClientProps = {
  eventId: string;
};

export const EventDetailClient = ({ eventId }: EventDetailClientProps) => {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const { student } = useUserStore();

  const {
    data: event,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['eventDetails', eventId],
    queryFn: async () => await eventApi.getEvent(eventId),
    enabled: !!eventId,
  });

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await eventApi.registerEvent({
        eventId,
      });
      toast.success('Event registration successful');
      refetch();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setRegistering(false);
    }
  };

  const registration = useMemo(
    () =>
      event?.registrations.find(
        (register: EventRegistration) => register.studentId === student?.id
      ),
    [event]
  );

  const handleCancelRegistration = async () => {
    if (!registration) return;

    try {
      setRegistering(true);
      await eventApi.cancelRegistration(registration.id);
      toast.success('Registration cancelled successfully');
      refetch();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setRegistering(false);
    }
  };

  const isRegistrationOpen = (event: Event) => {
    if (event.registrationDeadline) {
      return DateTime.fromISO(event.registrationDeadline) > DateTime.now();
    }
    return DateTime.fromISO(event.startTime) > DateTime.now();
  };

  const getRegistrationStatus = () => {
    if (!registration) {
      return isRegistrationOpen(event!) ? 'Open' : 'Closed';
    }
    return registration.status;
  };

  const getBadgeColor = (status: string) => {
    switch (status) {
      case EventRegistrationStatus.APPROVED:
        return 'default';
      case EventRegistrationStatus.REJECTED:
        return 'destructive';
      case EventRegistrationStatus.CANCELLED:
        return 'outline';
      case EventRegistrationStatus.ATTENDED:
        return 'default';
      case 'Open':
        return 'default';
      case 'Closed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  if (isLoading || !event) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  const status = getRegistrationStatus();
  const canRegister = !registration && isRegistrationOpen(event);
  const showCancelButton =
    registration && registration.status === EventRegistrationStatus.PENDING;

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          className='p-0 h-auto'
          onClick={() => router.back()}
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back
        </Button>
      </div>

      <Card>
        {event.imageUrl && (
          <div className='relative w-full h-[300px] mb-4'>
            <img
              src={event.imageUrl}
              alt={event.name}
              className='w-full h-full object-cover rounded-t-lg'
            />
          </div>
        )}
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              <CardTitle className='text-2xl mb-2'>{event.name}</CardTitle>
              {event.category && (
                <Badge variant='outline' className='mb-4'>
                  {event.category}
                </Badge>
              )}
            </div>
            <Badge variant={getBadgeColor(status)}>{status}</Badge>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          <div className='prose max-w-none'>
            <p>{event.description}</p>
          </div>

          <div className='grid gap-4'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-gray-500' />
              <span>
                {DateTime.fromISO(event.startTime).toFormat(
                  'EEEE, MMMM d, yyyy'
                )}
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

            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-gray-500' />
              <span>Capacity: {event.capacity} attendees</span>
            </div>
          </div>

          {event.registrationDeadline && (
            <div className='text-sm text-gray-500'>
              Registration deadline:{' '}
              {DateTime.fromISO(event.registrationDeadline).toFormat(
                'MMMM d, yyyy h:mm a'
              )}
            </div>
          )}

          {canRegister && (
            <div className='flex justify-end'>
              <Button onClick={handleRegister} disabled={registering}>
                {registering ? 'Registering...' : 'Register for Event'}
              </Button>
            </div>
          )}

          {showCancelButton && (
            <div className='flex justify-end'>
              <Button
                variant='destructive'
                onClick={handleCancelRegistration}
                disabled={registering}
              >
                {registering ? 'Cancelling...' : 'Cancel Registration'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
