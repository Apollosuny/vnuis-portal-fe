'use client';

import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import {
  BarChart4,
  Calendar,
  CheckCircle,
  Filter,
  MapPin,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventApi } from '@/api/event.api';
import { DateTime } from 'luxon';
import { toast } from 'sonner';
import { getAPIErrorMessage } from '@/utils/error';
import { Event, EventRegistration } from '@/types/event.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';

const EventsPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'events' | 'registrations'>(
    'events'
  );

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        return await eventApi.getEvents();
      } catch (error) {
        console.error('Failed to load events:', error);
        toast.error(getAPIErrorMessage(error));
        return [];
      }
    },
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['eventRegistrations'],
    queryFn: async () => {
      try {
        return await eventApi.getEventRegistrations({});
      } catch (error) {
        console.error('Failed to load registrations:', error);
        toast.error(getAPIErrorMessage(error));
        return [];
      }
    },
  });

  // Filter events based on search term and publication status
  const filteredEvents = events.filter((event: Event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPublished =
      publishedFilter === 'ALL' ||
      (publishedFilter === 'PUBLISHED' && event.isPublished) ||
      (publishedFilter === 'UNPUBLISHED' && !event.isPublished);

    return matchesSearch && matchesPublished;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return DateTime.fromISO(dateString).toFormat('MMM d, yyyy');
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return DateTime.fromISO(dateString).toFormat('hh:mm a');
  };

  // Calculate registration percentage
  const getRegistrationPercentage = (eventId: string, capacity: number) => {
    const eventRegistrations = registrations.filter(
      (reg: EventRegistration) =>
        reg.eventId === eventId && reg.status === 'APPROVED'
    );
    return Math.round((eventRegistrations.length / capacity) * 100);
  };

  if (eventsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center'>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='text'
              placeholder='Search events...'
              className='pl-8 w-[280px]'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-muted-foreground' />
            <Select value={publishedFilter} onValueChange={setPublishedFilter}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='Filter status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Events</SelectItem>
                <SelectItem value='PUBLISHED'>Published Only</SelectItem>
                <SelectItem value='UNPUBLISHED'>Unpublished Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex gap-2 w-full sm:w-auto'>
          <Button
            variant={viewMode === 'events' ? 'default' : 'outline'}
            onClick={() => setViewMode('events')}
          >
            Events
          </Button>
          <Button
            variant={viewMode === 'registrations' ? 'default' : 'outline'}
            onClick={() => setViewMode('registrations')}
          >
            Registrations
          </Button>
        </div>
      </div>

      <div>
        {viewMode === 'events' ? (
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Registered Events</CardTitle>
                <Button
                  variant='default'
                  className='shrink-0'
                  onClick={() => {
                    // Navigate to create event page
                  }}
                >
                  <Plus className='h-4 w-4 mr-1' />
                  New Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='relative w-full overflow-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Registrations</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event: Event) => {
                      const registrationCount = registrations.filter(
                        (reg: EventRegistration) =>
                          reg.eventId === event.id && reg.status === 'APPROVED'
                      ).length;
                      const percentage = getRegistrationPercentage(
                        event.id,
                        event.capacity
                      );

                      return (
                        <TableRow key={event.id}>
                          <TableCell className='font-medium w-[250px]'>
                            <div className='truncate'>{event.name}</div>
                            <div className='text-sm text-muted-foreground line-clamp-2'>
                              {event.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1'>
                              <Calendar className='h-4 w-4 text-muted-foreground' />
                              <div>
                                <div>{formatDate(event.startTime)}</div>
                                <div className='text-muted-foreground text-sm'>
                                  {formatTime(event.startTime)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1'>
                              <MapPin className='h-4 w-4 text-muted-foreground' />
                              <span>{event.location}</span>
                            </div>
                          </TableCell>
                          <TableCell className='w-[160px]'>
                            <div>
                              <div className='flex items-center gap-1 text-sm'>
                                <Users className='h-4 w-4 text-muted-foreground' />
                                <span>
                                  {registrationCount}/{event.capacity}
                                </span>
                              </div>
                              <div className='mt-1 h-2 w-full rounded-full bg-secondary'>
                                <div
                                  className='h-full rounded-full bg-primary'
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                event.isPublished ? 'default' : 'secondary'
                              }
                            >
                              {event.isPublished ? (
                                <CheckCircle className='h-3 w-3 mr-1' />
                              ) : (
                                <X className='h-3 w-3 mr-1' />
                              )}
                              {event.isPublished ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => {
                                // Navigate to event details/edit page
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className='flex justify-between border-t pt-6'>
              <div className='flex items-center gap-2'>
                <BarChart4 className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm text-muted-foreground'>
                  Showing {filteredEvents.length} events
                </span>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='relative w-full overflow-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((reg: EventRegistration) => {
                      const event = events.find(
                        (e: Event) => e.id === reg.eventId
                      );
                      if (!event) return null;

                      return (
                        <TableRow key={reg.id}>
                          <TableCell>{event.name}</TableCell>
                          <TableCell>Student {reg.studentId}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                reg.status === 'APPROVED'
                                  ? 'default'
                                  : reg.status === 'PENDING'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {reg.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size='sm' variant='ghost'>
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventsPanel;
