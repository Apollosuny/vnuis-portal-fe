'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Controller } from 'react-hook-form';
import { useEventFilter } from '@/hooks/useEvent';
import { eventApi } from '@/api/event.api';
import { Event } from '@/types/event.types';
import { DateTime } from 'luxon';
import { PlusIcon, FilterIcon, DownloadIcon, UsersIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { getAPIErrorMessage } from '@/utils/error';
import { EventAnalytics } from '@/components/admin/events/event-analytics';

// Import UI components from workspace
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

// Import form components
import { FormInput } from '@/components/ui/form-input';
import { FormDateTimePicker } from '@/components/ui/form-date-time-picker';
import { FormSelect } from '@/components/ui/form-select';
import { FormButton } from '@/components/ui/form-button';

// Define types
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  studentId: string;
  email: string;
}

interface Registration {
  id: string;
  eventId: string;
  student?: Student;
  status: string;
  createdAt: string;
}

export const EventsClient = () => {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'registrations'>(
    'events'
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { control, handleFilter, resetFilter } = useEventFilter();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchRegistrations(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventApi.getEvents();
      setEvents(data);
      if (data.length > 0) {
        setSelectedEvent(data[0]);
      }
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    try {
      setRegistrationsLoading(true);
      const data = await eventApi.getEventRegistrations({ eventId });
      setRegistrations(data);
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    } finally {
      setRegistrationsLoading(false);
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

  const handleExportCSV = () => {
    if (!selectedEvent || registrations.length === 0) return;

    // Filter registrations based on status if needed
    const filteredRegistrations =
      statusFilter === 'all'
        ? registrations
        : registrations.filter(
            (reg) => reg.status.toLowerCase() === statusFilter.toLowerCase()
          );

    // Create CSV content
    const csvContent = [
      // CSV Headers
      ['Student ID', 'Full Name', 'Email', 'Registration Date', 'Status'].join(
        ','
      ),
      // CSV Data
      ...filteredRegistrations.map((reg) =>
        [
          reg.student?.studentId || 'N/A',
          `${reg.student?.firstName} ${reg.student?.lastName}`,
          reg.student?.email || 'N/A',
          DateTime.fromISO(reg.createdAt).toFormat('yyyy-MM-dd HH:mm:ss'),
          reg.status,
        ].join(',')
      ),
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedEvent.name}-registrations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='space-y-4 p-4 md:p-8'>
      {/* Mobile Title */}
      <div className='sm:hidden mb-6'>
        <h1 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
          Events Management
        </h1>
        <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
          Manage and organize all your events
        </p>
      </div>

      {/* Desktop Title and Actions */}
      <div className='hidden sm:flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>
            Events Management
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Manage and organize all your events
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
          <Button
            variant='outline'
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center justify-center gap-2 w-full sm:w-auto'
          >
            <FilterIcon size={16} />
            Filters
          </Button>
          <Button
            onClick={() => router.push('/dashboard/events/create')}
            className='flex items-center justify-center gap-2 w-full sm:w-auto'
          >
            <PlusIcon size={16} />
            Create Event
          </Button>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className='sm:hidden flex flex-col gap-2'>
        <Button
          variant='outline'
          onClick={() => setShowFilters(!showFilters)}
          className='flex items-center justify-center gap-2 w-full'
        >
          <FilterIcon size={16} />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
        <Button
          onClick={() => router.push('/dashboard/events/create')}
          className='flex items-center justify-center gap-2 w-full'
        >
          <PlusIcon size={16} />
          Create Event
        </Button>
      </div>

      {loading ? (
        <div className='flex justify-center items-center py-8'>
          <Spinner size='lg' />
        </div>
      ) : events.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          No events found. Create your first event by clicking the &quot;Create
          Event&quot; button.
        </div>
      ) : (
        <>
          <EventAnalytics events={events} />

          {showFilters && (
            <Card className='mb-4'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-lg text-gray-900 dark:text-gray-100'>
                  Filter Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleFilter(e);
                  }}
                >
                  <div className='space-y-2'>
                    <label
                      htmlFor='searchTerm'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Search
                    </label>
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
                    <label
                      htmlFor='startDate'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Start Date
                    </label>
                    <Controller
                      name='startDate'
                      control={control}
                      render={({ field }) => (
                        <FormDateTimePicker {...field} id='startDate' />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <label
                      htmlFor='endDate'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      End Date
                    </label>
                    <Controller
                      name='endDate'
                      control={control}
                      render={({ field }) => (
                        <FormDateTimePicker {...field} id='endDate' />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <label
                      htmlFor='category'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Category
                    </label>
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
                    <label
                      htmlFor='isPublished'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300'
                    >
                      Status
                    </label>
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

                  <div className='flex flex-col sm:flex-row items-end gap-2 sm:col-span-2 lg:col-span-1'>
                    <FormButton type='submit' className='w-full sm:flex-1'>
                      Apply Filters
                    </FormButton>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={resetFilter}
                      className='w-full sm:w-auto'
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Tabs
        defaultValue='events'
        className='w-full'
        onValueChange={(value) =>
          setActiveTab(value as 'events' | 'registrations')
        }
      >
        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4'>
          <TabsList className='w-full sm:w-auto'>
            <TabsTrigger value='events' className='flex-1 sm:min-w-[120px]'>
              Events List
            </TabsTrigger>
            <TabsTrigger
              value='registrations'
              className='flex-1 sm:min-w-[120px]'
            >
              Registrations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='events' className='mt-0'>
          <Card>
            <CardContent className='p-0'>
              {loading ? (
                <div className='flex justify-center items-center py-8'>
                  <Spinner size='lg' />
                </div>
              ) : events.length === 0 ? (
                <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                  No events found. Create your first event by clicking the
                  &quot;Create Event&quot; button.
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className='sm:hidden space-y-4 p-4'>
                    {events.map((event) => (
                      <Card
                        key={event.id}
                        className='border border-gray-200 dark:border-gray-700'
                      >
                        <CardHeader className='pb-3'>
                          <div className='flex flex-col gap-2'>
                            <div className='flex items-start justify-between'>
                              <CardTitle className='text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2'>
                                {event.name}
                              </CardTitle>
                              <Badge
                                variant={
                                  event.isPublished ? 'default' : 'secondary'
                                }
                                className='ml-2 flex-shrink-0'
                              >
                                {event.isPublished ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              {DateTime.fromISO(event.startTime).toFormat(
                                'MMM dd, yyyy'
                              )}{' '}
                              •{' '}
                              {DateTime.fromISO(event.startTime).toFormat(
                                'h:mm a'
                              )}{' '}
                              -{' '}
                              {DateTime.fromISO(event.endTime).toFormat(
                                'h:mm a'
                              )}
                            </div>
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              📍 {event.location}
                            </div>
                            {event.category && (
                              <div className='text-sm text-gray-600 dark:text-gray-400'>
                                🏷️ {event.category}
                              </div>
                            )}
                            <div className='text-sm text-gray-600 dark:text-gray-400'>
                              👥 Capacity: {event.capacity}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className='pt-0'>
                          <div className='grid grid-cols-2 gap-2'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                router.push(`/dashboard/events/${event.id}`)
                              }
                              className='w-full'
                            >
                              View
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                router.push(
                                  `/dashboard/events/${event.id}/edit`
                                )
                              }
                              className='w-full'
                            >
                              Edit
                            </Button>
                            <Button
                              size='sm'
                              variant={
                                event.isPublished ? 'destructive' : 'default'
                              }
                              onClick={() => handlePublishToggle(event)}
                              className='w-full'
                            >
                              {event.isPublished ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() => handleDeleteEvent(event.id)}
                              className='w-full'
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className='hidden sm:block overflow-x-auto'>
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
                                {DateTime.fromISO(event.startTime).toFormat(
                                  'h:mm a'
                                )}{' '}
                                -{' '}
                                {DateTime.fromISO(event.endTime).toFormat(
                                  'h:mm a'
                                )}
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
                                variant={
                                  event.isPublished ? 'default' : 'secondary'
                                }
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
                                  router.push(
                                    `/dashboard/events/${event.id}/edit`
                                  )
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
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='registrations' className='mt-0'>
          <Card>
            <CardHeader>
              <div className='flex flex-col gap-4'>
                <div>
                  <CardTitle className='flex items-center gap-2 text-gray-900 dark:text-gray-100'>
                    <UsersIcon className='h-6 w-6 text-primary' />
                    Event Registrations ({registrations.length})
                  </CardTitle>
                  <CardDescription className='text-gray-600 dark:text-gray-400'>
                    {selectedEvent
                      ? `Managing registrations for "${selectedEvent.name}"`
                      : 'View and manage event registrations'}
                  </CardDescription>
                </div>

                {/* Mobile Controls */}
                <div className='sm:hidden space-y-3'>
                  <div className='grid grid-cols-1 gap-3'>
                    <Select
                      value={selectedEvent?.id}
                      onValueChange={(value) => {
                        const event = events.find((e) => e.id === value);
                        if (event) setSelectedEvent(event);
                      }}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select Event' />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Filter Status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>All Status</SelectItem>
                        <SelectItem value='pending'>Pending</SelectItem>
                        <SelectItem value='approved'>Approved</SelectItem>
                        <SelectItem value='rejected'>Rejected</SelectItem>
                        <SelectItem value='cancelled'>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant='default'
                      className='flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full'
                      onClick={handleExportCSV}
                      disabled={!selectedEvent || registrations.length === 0}
                    >
                      <DownloadIcon size={16} />
                      Export to Excel
                    </Button>
                  </div>
                </div>

                {/* Desktop Controls */}
                <div className='hidden sm:flex flex-col md:flex-row justify-between md:items-center gap-4'>
                  <div className='flex items-center gap-4 flex-wrap'>
                    <div className='flex items-center gap-2'>
                      <Select
                        value={selectedEvent?.id}
                        onValueChange={(value) => {
                          const event = events.find((e) => e.id === value);
                          if (event) setSelectedEvent(event);
                        }}
                      >
                        <SelectTrigger className='w-[200px]'>
                          <SelectValue placeholder='Select Event' />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className='w-[150px]'>
                          <SelectValue placeholder='Filter Status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>All Status</SelectItem>
                          <SelectItem value='pending'>Pending</SelectItem>
                          <SelectItem value='approved'>Approved</SelectItem>
                          <SelectItem value='rejected'>Rejected</SelectItem>
                          <SelectItem value='cancelled'>Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant='default'
                      className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white'
                      onClick={handleExportCSV}
                      disabled={!selectedEvent || registrations.length === 0}
                    >
                      <DownloadIcon size={16} />
                      Export to Excel
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {registrationsLoading ? (
                <div className='flex justify-center items-center py-8'>
                  <Spinner size='lg' />
                </div>
              ) : !selectedEvent ? (
                <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                  Please select an event to view registrations.
                </div>
              ) : registrations.length === 0 ? (
                <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                  No registrations found for this event.
                </div>
              ) : (
                <>
                  {/* Mobile Cards View */}
                  <div className='sm:hidden space-y-4'>
                    {registrations
                      .filter(
                        (reg) =>
                          statusFilter === 'all' ||
                          reg.status.toLowerCase() ===
                            statusFilter.toLowerCase()
                      )
                      .map((registration) => (
                        <Card
                          key={registration.id}
                          className='border border-gray-200 dark:border-gray-700'
                        >
                          <CardContent className='p-4'>
                            <div className='space-y-3'>
                              <div className='flex items-start justify-between'>
                                <div className='flex-1 min-w-0'>
                                  <h4 className='font-medium text-gray-900 dark:text-gray-100 truncate'>
                                    {registration.student?.firstName}{' '}
                                    {registration.student?.lastName}
                                  </h4>
                                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                                    ID: {registration.student?.studentId}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    registration.status === 'APPROVED'
                                      ? 'default'
                                      : registration.status === 'PENDING'
                                        ? 'secondary'
                                        : registration.status === 'REJECTED'
                                          ? 'destructive'
                                          : 'outline'
                                  }
                                >
                                  {registration.status}
                                </Badge>
                              </div>

                              <div className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
                                <p>📧 {registration.student?.email}</p>
                                <p>
                                  📅 Registered on{' '}
                                  {DateTime.fromISO(
                                    registration.createdAt
                                  ).toFormat('dd/MM/yyyy HH:mm')}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className='hidden sm:block overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Student ID</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registration Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrations
                          .filter(
                            (reg) =>
                              statusFilter === 'all' ||
                              reg.status.toLowerCase() ===
                                statusFilter.toLowerCase()
                          )
                          .map((registration) => (
                            <TableRow key={registration.id}>
                              <TableCell>
                                {registration.student?.firstName}{' '}
                                {registration.student?.lastName}
                              </TableCell>
                              <TableCell>
                                {registration.student?.studentId}
                              </TableCell>
                              <TableCell>
                                {registration.student?.email}
                              </TableCell>
                              <TableCell>
                                {DateTime.fromISO(
                                  registration.createdAt
                                ).toFormat('dd/MM/yyyy HH:mm')}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    registration.status === 'APPROVED'
                                      ? 'default'
                                      : registration.status === 'PENDING'
                                        ? 'secondary'
                                        : registration.status === 'REJECTED'
                                          ? 'destructive'
                                          : 'outline'
                                  }
                                >
                                  {registration.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
