import {
  Event,
  EventRegistration,
  EventRegistrationStatus,
} from '@/types/event.types';
import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Calendar, Clock, FileCheck, MapPin, Users } from 'lucide-react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type Props = {
  event: Event;
  registration?: EventRegistration;
  isRegistered?: boolean;
};

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

export const EventCard: React.FC<Props> = ({
  event,
  registration,
  isRegistered,
}) => {
  const router = useRouter();

  const isOpenedForRegistration = useMemo(() => {
    const now = DateTime.now();
    const startTime = DateTime.fromISO(event.startTime);
    const endTime = DateTime.fromISO(event.endTime);
    const registrationDeadline = DateTime.fromISO(event.registrationDeadline!);
    if (event.registrationDeadline) {
      return now < registrationDeadline && now < startTime;
    }
    return now < startTime;
  }, []);

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
                {/* {remainingSpots} / {event.capacity} spots left */}0 spots
                left
              </span>
            </div>
          </div>
        </div>

        {registration ? (
          <div className='mt-2'>
            <Badge
              variant={getRegistrationBadgeVariant(registration.status)}
              className='w-full flex items-center justify-center'
            >
              <FileCheck className='h-3 w-3 mr-1' />
              Status: {registration.status}
            </Badge>
          </div>
        ) : isOpenedForRegistration ? (
          <div className='mt-2'>
            <Badge
              variant='default'
              className='w-full flex items-center justify-center'
            >
              <FileCheck className='h-3 w-3 mr-1' />
              Open for Registration
            </Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
