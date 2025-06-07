import { FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Calendar } from 'lucide-react';
import { Event } from '@/types/event.types';
import { DateTime } from 'luxon';
import { cn } from '@workspace/ui/lib/utils';

interface UpcomingEventsCardProps {
  upcomingCount: number;
  events: Event[];
}

export const UpcomingEventsCard: FC<UpcomingEventsCardProps> = ({
  upcomingCount,
  events,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Calendar className='h-4 w-4' />
          Upcoming Events
        </CardTitle>
        <CardDescription>
          You have {upcomingCount} upcoming events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {events.map((event) => {
            const eventDate = DateTime.fromISO(event.startTime);
            const isToday = eventDate.hasSame(DateTime.now(), 'day');
            const isTomorrow = eventDate.hasSame(
              DateTime.now().plus({ days: 1 }),
              'day'
            );

            const dateLabel = isToday
              ? 'Today'
              : isTomorrow
                ? 'Tomorrow'
                : eventDate.toFormat('LLL d');

            return (
              <div
                key={event.id}
                className='flex items-center justify-between p-3 bg-muted/50 rounded-md'
              >
                <div>
                  <p className='font-medium'>{event.name}</p>
                  <p className='text-sm text-muted-foreground'>
                    {dateLabel} • {event.location}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-xs py-1 px-2 rounded',
                    'bg-primary text-primary-foreground'
                  )}
                >
                  {eventDate.toFormat('HH:mm')}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
