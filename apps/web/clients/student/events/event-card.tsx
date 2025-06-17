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
import { cn } from '@workspace/ui/lib/utils';

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
      className={cn(
        'p-4 group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border bg-background shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
        'before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-gradient-to-br before:from-blue-400/20 before:to-purple-500/20 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100'
      )}
      onClick={() => router.push(`/student-dashboard/events/${event.id}`)}
    >
      <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 transform origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100' />

      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span className='truncate flex-1 group-hover:text-blue-600 transition-colors duration-300'>
            {event.name}
          </span>
          {event.category && (
            <Badge
              variant='outline'
              className='ml-2 shrink-0 transition-all duration-300 group-hover:bg-blue-100 group-hover:text-blue-700'
            >
              {event.category}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className='flex-1 space-y-4'>
        <div className='space-y-3 transform transition-transform duration-500'>
          <div className='flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-200'>
            <Calendar className='h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors duration-300' />
            <span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300'>
              {DateTime.fromISO(event.startTime).toFormat('EEEE, MMMM d, yyyy')}
            </span>
          </div>

          <div className='flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-75'>
            <Clock className='h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors duration-300' />
            <span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300'>
              {DateTime.fromISO(event.startTime).toFormat('h:mm a')} -{' '}
              {DateTime.fromISO(event.endTime).toFormat('h:mm a')}
            </span>
          </div>

          <div className='flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300 delay-100'>
            <MapPin className='h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors duration-300' />
            <span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300'>
              {event.location}
            </span>
          </div>

          <div className='flex justify-between items-center group-hover:translate-x-1 transition-transform duration-300 delay-150'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-gray-500 group-hover:text-blue-500 transition-colors duration-300' />
              <span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300'>
                {/* {remainingSpots} / {event.capacity} spots left */}0 spots
                left
              </span>
            </div>
          </div>
        </div>

        {registration ? (
          <div className='mt-4 transform transition-all duration-300 group-hover:scale-105'>
            <Badge
              variant={getRegistrationBadgeVariant(registration.status)}
              className='w-full flex items-center justify-center py-1.5 shadow-sm group-hover:shadow-md transition-shadow duration-300'
            >
              <FileCheck className='h-3 w-3 mr-1.5 animate-pulse' />
              Status: {registration.status}
            </Badge>
          </div>
        ) : isOpenedForRegistration ? (
          <div className='mt-4 transform transition-all duration-300 group-hover:scale-105'>
            <Badge
              variant='default'
              className='w-full flex items-center justify-center py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 shadow-sm group-hover:shadow-md transition-shadow duration-300 pulse-border-animation'
            >
              <FileCheck className='h-3 w-3 mr-1.5' />
              Open for Registration
            </Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
