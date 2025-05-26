'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Controller } from 'react-hook-form';
import { useEventFilter } from '@/hooks/useEvent';
import { eventApi } from '@/api/event.api';
import { Event } from '@/types/event.types';
import { DateTime } from 'luxon';
import { PlusIcon, FilterIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { getAPIErrorMessage } from '@/utils/error';

// Import UI components from workspace
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';

// Import form components
import { FormInput } from '@/components/ui/form-input';
import { FormDateTimePicker } from '@/components/ui/form-date-time-picker';
import { FormSelect } from '@/components/ui/form-select';
import { FormButton } from '@/components/ui/form-button';

export const EventsClient = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const { control, handleFilter, resetFilter } = useEventFilter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventApi.getEvents();
      setEvents(data);
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (event: Event) => {
    try {
      if (event.isPublished) {
        await eventApi.unpublishEvent(event.id);
      } else {
        await eventApi.publishEvent(event.id);
      }
      fetchEvents();
      toast.success(
        `Event ${event.isPublished ? 'unpublished' : 'published'} successfully`
      );
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventApi.deleteEvent(id);
      fetchEvents();
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    }
  };

  return (
    <div className='space-y-4 p-4 md:p-8'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <h1 className='text-2xl font-bold'>Events</h1>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-1'
          >
            <FilterIcon size={16} />
            Filters
          </Button>
          <Button
            onClick={() => router.push('/dashboard/events/create')}
            className='flex items-center gap-1'
          >
            <PlusIcon size={16} />
            Create Event
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className='mb-4'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-lg'>Filter Events</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              onSubmit={(e) => {
                e.preventDefault();
                handleFilter(e);
              }}
            >
              <div className='space-y-2'>
                <label htmlFor='searchTerm'>Search</label>
                <Controller
                  name='searchTerm'
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      {...field}
                      id='searchTerm'
                      placeholder='Search by name or description'
                    />
                  )}
                />
              </div>

              <div className='space-y-2'>
                <label htmlFor='startDate'>Start Date</label>
                <Controller
                  name='startDate'
                  control={control}
                  render={({ field }) => (
                    <FormDateTimePicker {...field} id='startDate' />
                  )}
                />
              </div>

              <div className='space-y-2'>
                <label htmlFor='endDate'>End Date</label>
                <Controller
                  name='endDate'
                  control={control}
                  render={({ field }) => (
                    <FormDateTimePicker {...field} id='endDate' />
                  )}
                />
              </div>

              <div className='space-y-2'>
                <label htmlFor='category'>Category</label>
                <Controller
                  name='category'
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      options={[
                        { label: 'All Categories', value: '' },
                        { label: 'Academic', value: 'academic' },
                        { label: 'Social', value: 'social' },
                        { label: 'Cultural', value: 'cultural' },
                        { label: 'Sports', value: 'sports' },
                      ]}
                    />
                  )}
                />
              </div>

              <div className='space-y-2'>
                <label htmlFor='isPublished'>Status</label>
                <Controller
                  name='isPublished'
                  control={control}
                  render={({ field }) => (
                    <FormSelect
                      {...field}
                      value={field.value?.toString() || ''}
                      options={[
                        { label: 'All', value: '' },
                        { label: 'Published', value: 'true' },
                        { label: 'Draft', value: 'false' },
                      ]}
                    />
                  )}
                />
              </div>

              <div className='flex items-end space-x-2 md:col-span-2 lg:col-span-1'>
                <FormButton type='submit' className='flex-1'>
                  Apply Filters
                </FormButton>
                <Button type='button' variant='outline' onClick={resetFilter}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className='p-0'>
          {loading ? (
            <div className='flex justify-center items-center py-8'>
              <Spinner size='lg' />
            </div>
          ) : events.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              No events found. Create your first event by clicking the
              &quot;Create Event&quot; button.
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead className='hidden md:table-cell'>
                      Location
                    </TableHead>
                    <TableHead className='hidden lg:table-cell'>
                      Capacity
                    </TableHead>
                    <TableHead className='hidden lg:table-cell'>
                      Category
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className='font-medium'>
                        {event.name}
                      </TableCell>
                      <TableCell>
                        <div>
                          {DateTime.fromISO(event.startTime).toFormat(
                            'MMM dd, yyyy'
                          )}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {DateTime.fromISO(event.startTime).toFormat('h:mm a')}{' '}
                          - {DateTime.fromISO(event.endTime).toFormat('h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        {event.location}
                      </TableCell>
                      <TableCell className='hidden lg:table-cell'>
                        {event.capacity}
                      </TableCell>
                      <TableCell className='hidden lg:table-cell'>
                        {event.category || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={event.isPublished ? 'default' : 'secondary'}
                        >
                          {event.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right space-x-1'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            router.push(`/dashboard/events/${event.id}`)
                          }
                        >
                          View
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            router.push(`/dashboard/events/${event.id}/edit`)
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size='sm'
                          variant={
                            event.isPublished ? 'destructive' : 'default'
                          }
                          onClick={() => handlePublishToggle(event)}
                        >
                          {event.isPublished ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
