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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';

// Mock data for events
const mockEvents = [
  {
    id: 'event-1',
    name: 'Orientation Day',
    description: 'Welcome event for new students',
    location: 'Main Auditorium',
    startTime: '2025-05-28T09:00:00Z',
    endTime: '2025-05-28T12:00:00Z',
    capacity: 200,
    registrations: 124,
    isPublished: true,
    createdBy: 'Admin User',
  },
  {
    id: 'event-2',
    name: 'Career Fair',
    description: 'Annual career fair with industry partners',
    location: 'Exhibition Hall',
    startTime: '2025-06-05T10:00:00Z',
    endTime: '2025-06-05T16:00:00Z',
    capacity: 500,
    registrations: 320,
    isPublished: true,
    createdBy: 'Admin User',
  },
  {
    id: 'event-3',
    name: 'Alumni Networking Night',
    description: 'Networking event for alumni and current students',
    location: 'Conference Center',
    startTime: '2025-06-12T18:00:00Z',
    endTime: '2025-06-12T21:00:00Z',
    capacity: 150,
    registrations: 87,
    isPublished: false,
    createdBy: 'Admin User',
  },
  {
    id: 'event-4',
    name: 'Technology Workshop',
    description: 'Hands-on workshop on emerging technologies',
    location: 'Computer Lab Building',
    startTime: '2025-06-15T13:30:00Z',
    endTime: '2025-06-15T16:30:00Z',
    capacity: 80,
    registrations: 65,
    isPublished: true,
    createdBy: 'Admin User',
  },
  {
    id: 'event-5',
    name: 'End of Semester Concert',
    description: 'Concert featuring student performances',
    location: 'Outdoor Amphitheater',
    startTime: '2025-06-22T19:00:00Z',
    endTime: '2025-06-22T22:00:00Z',
    capacity: 300,
    registrations: 210,
    isPublished: true,
    createdBy: 'Admin User',
  },
];

const mockRegistrations = [
  {
    id: 'reg-1',
    eventId: 'event-1',
    status: 'PENDING',
    studentName: 'John Doe',
  },
  {
    id: 'reg-2',
    eventId: 'event-1',
    status: 'APPROVED',
    studentName: 'Jane Smith',
  },
  {
    id: 'reg-3',
    eventId: 'event-2',
    status: 'PENDING',
    studentName: 'Mike Johnson',
  },
];

const EventsPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'events' | 'registrations'>(
    'events'
  );

  // Filter events based on search term and publication status
  const filteredEvents = mockEvents.filter((event) => {
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Calculate registration percentage
  const getRegistrationPercentage = (
    registrations: number,
    capacity: number
  ) => {
    return Math.round((registrations / capacity) * 100);
  };

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

        <div className='flex items-center gap-2'>
          <Button
            variant={viewMode === 'events' ? 'default' : 'outline'}
            onClick={() => setViewMode('events')}
            className='flex items-center gap-2'
          >
            <Calendar className='size-4' />
            <span>Events</span>
          </Button>
          <Button
            variant={viewMode === 'registrations' ? 'default' : 'outline'}
            onClick={() => setViewMode('registrations')}
            className='flex items-center gap-2'
          >
            <Users className='size-4' />
            <span>Registrations</span>
          </Button>
          <Button className='flex items-center gap-2'>
            <Plus className='size-4' />
            <span>Create Event</span>
          </Button>
        </div>
      </div>

      {viewMode === 'events' ? (
        <Card>
          <CardHeader className='px-6'>
            <div className='flex justify-between items-center'>
              <CardTitle className='flex items-center gap-2'>
                <BarChart4 className='size-5' />
                <span>Events Management</span>
              </CardTitle>
              <Badge className='bg-primary'>
                {filteredEvents.length} Events
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='px-6'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date & Location</TableHead>
                  <TableHead>Registrations</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className='font-medium'>{event.name}</div>
                      <div className='text-xs text-muted-foreground'>
                        {event.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span>{formatDate(event.startTime)}</span>
                        <span className='text-xs text-muted-foreground'>
                          {formatTime(event.startTime)} -{' '}
                          {formatTime(event.endTime)}
                        </span>
                        <span className='text-xs text-muted-foreground flex items-center gap-1 mt-1'>
                          <MapPin className='size-3' /> {event.location}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col gap-1'>
                        <div className='flex justify-between text-sm'>
                          <span>
                            {event.registrations}/{event.capacity}
                          </span>
                          <span>
                            {getRegistrationPercentage(
                              event.registrations,
                              event.capacity
                            )}
                            %
                          </span>
                        </div>
                        <div className='w-full bg-muted rounded-full h-2'>
                          <div
                            className='bg-primary h-2 rounded-full'
                            style={{
                              width: `${getRegistrationPercentage(event.registrations, event.capacity)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.isPublished ? (
                        <Badge className='bg-emerald-500'>Published</Badge>
                      ) : (
                        <Badge className='bg-amber-500'>Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        {!event.isPublished ? (
                          <Button variant='outline' size='sm' className='h-8'>
                            Publish
                          </Button>
                        ) : (
                          <Button variant='outline' size='sm' className='h-8'>
                            Unpublish
                          </Button>
                        )}
                        <Button variant='outline' size='sm' className='h-8'>
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className='px-6 border-t flex justify-between'>
            <div className='text-sm text-muted-foreground'>
              Showing {filteredEvents.length} of {mockEvents.length} events
            </div>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' disabled>
                Previous
              </Button>
              <Button variant='outline' size='sm' disabled>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader className='px-6'>
            <div className='flex justify-between items-center'>
              <CardTitle className='flex items-center gap-2'>
                <Users className='size-5' />
                <span>Event Registrations</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className='px-6'>
            <div className='text-center text-muted-foreground p-8'>
              Registration list would be shown here
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventsPanel;
