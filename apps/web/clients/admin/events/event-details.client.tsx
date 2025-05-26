'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { eventApi } from '@/api/event.api';
import {
  Event,
  EventRegistration,
  EventRegistrationStatus,
} from '@/types/event.types';
import { toast } from 'sonner';
import { DateTime } from 'luxon';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileCheck,
} from 'lucide-react';
import { useEventRegistrationManagement } from '@/hooks/useEvent';
import { getAPIErrorMessage } from '@/utils/error';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';

type EventDetailsClientProps = {
  eventId: string;
};

export const EventDetailsClient = ({ eventId }: EventDetailsClientProps) => {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);

  const { isLoading: statusUpdateLoading, handleUpdateStatus } =
    useEventRegistrationManagement();

  useEffect(() => {
    fetchEvent();
    fetchRegistrations();
  }, []);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await eventApi.getEvent(eventId);
      setEvent(data);
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
      router.push('/dashboard/events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
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

  const handlePublishToggle = async () => {
    if (!event) return;

    try {
      if (event.isPublished) {
        await eventApi.unpublishEvent(eventId);
        toast.success('Event unpublished successfully');
      } else {
        await eventApi.publishEvent(eventId);
        toast.success('Event published successfully');
      }
      fetchEvent();
    } catch (error) {
      toast.error(getAPIErrorMessage(error));
    }
  };

  const updateRegistrationStatus = async (
    registrationId: string,
    status: EventRegistrationStatus
  ) => {
    handleUpdateStatus(registrationId, status, undefined, () => {
      fetchRegistrations();
    });
  };

  const getBadgeVariant = (status: EventRegistrationStatus) => {
    switch (status) {
      case EventRegistrationStatus.APPROVED:
        return 'success';
      case EventRegistrationStatus.REJECTED:
        return 'destructive';
      case EventRegistrationStatus.CANCELLED:
        return 'outline';
      case EventRegistrationStatus.ATTENDED:
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[50vh]'>
        <Spinner size='lg' />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className='space-y-6 p-4 md:p-8'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='p-0 h-auto'
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className='text-2xl font-bold'>{event.name}</h1>
          <Badge>{event.isPublished ? 'Published' : 'Draft'}</Badge>
        </div>

        <div className='flex gap-2 self-end md:self-auto'>
          <Button onClick={handlePublishToggle}>
            {event.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
          <Button
            variant='outline'
            onClick={() => router.push(`/dashboard/events/${eventId}/edit`)}
          >
            Edit Event
          </Button>
        </div>
      </div>

      <Tabs defaultValue='details'>
        <TabsList>
          <TabsTrigger value='details'>Event Details</TabsTrigger>
          <TabsTrigger value='registrations'>Registrations</TabsTrigger>
        </TabsList>

        <TabsContent value='details' className='mt-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <p className='whitespace-pre-wrap'>{event.description}</p>

                {event.imageUrl && (
                  <div className='mt-4'>
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className='w-full h-auto max-h-96 object-cover rounded-md'
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className='space-y-6'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-lg'>Event Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-start gap-3'>
                    <Calendar className='h-5 w-5 mt-0.5 text-gray-500' />
                    <div>
                      <div className='font-medium'>Date</div>
                      <div>
                        {DateTime.fromISO(event.startTime).toFormat(
                          'EEEE, MMMM d, yyyy'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Clock className='h-5 w-5 mt-0.5 text-gray-500' />
                    <div>
                      <div className='font-medium'>Time</div>
                      <div>
                        {DateTime.fromISO(event.startTime).toFormat('h:mm a')} -{' '}
                        {DateTime.fromISO(event.endTime).toFormat('h:mm a')}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <MapPin className='h-5 w-5 mt-0.5 text-gray-500' />
                    <div>
                      <div className='font-medium'>Location</div>
                      <div>{event.location}</div>
                    </div>
                  </div>

                  <div className='flex items-start gap-3'>
                    <Users className='h-5 w-5 mt-0.5 text-gray-500' />
                    <div>
                      <div className='font-medium'>Capacity</div>
                      <div>{event.capacity} attendees</div>
                    </div>
                  </div>

                  {event.registrationDeadline && (
                    <div className='flex items-start gap-3'>
                      <FileCheck className='h-5 w-5 mt-0.5 text-gray-500' />
                      <div>
                        <div className='font-medium'>Registration Deadline</div>
                        <div>
                          {DateTime.fromISO(
                            event.registrationDeadline
                          ).toFormat('MMMM d, yyyy h:mm a')}
                        </div>
                      </div>
                    </div>
                  )}

                  {event.category && (
                    <div className='pt-2'>
                      <Badge variant='outline' className='mr-2'>
                        {event.category}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-lg'>Settings</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Require approval</span>
                    <Badge
                      variant={event.requireApproval ? 'default' : 'outline'}
                    >
                      {event.requireApproval ? 'Yes' : 'No'}
                    </Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Registration count</span>
                    <Badge variant='secondary'>{registrations.length}</Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>Spaces left</span>
                    <Badge>{event.capacity - registrations.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='registrations' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {registrationsLoading ? (
                <div className='flex justify-center items-center py-8'>
                  <Spinner size='lg' />
                </div>
              ) : registrations.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  No registrations yet for this event.
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Student ID</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations.map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              {registration.student?.avatarUrl && (
                                <div className='h-8 w-8 rounded-full overflow-hidden'>
                                  <img
                                    src={registration.student.avatarUrl}
                                    alt={`${registration.student.firstName} ${registration.student.lastName}`}
                                    className='h-full w-full object-cover'
                                  />
                                </div>
                              )}
                              <div>
                                {registration.student?.firstName}{' '}
                                {registration.student?.lastName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {registration.student?.studentId || '-'}
                          </TableCell>
                          <TableCell>
                            {DateTime.fromISO(registration.createdAt).toFormat(
                              'MMM dd, yyyy h:mm a'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge>{registration.status}</Badge>
                          </TableCell>
                          <TableCell className='text-right'>
                            {registration.status ===
                              EventRegistrationStatus.PENDING && (
                              <div className='space-x-2'>
                                <Button
                                  size='sm'
                                  onClick={() =>
                                    updateRegistrationStatus(
                                      registration.id,
                                      EventRegistrationStatus.APPROVED
                                    )
                                  }
                                  disabled={statusUpdateLoading}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size='sm'
                                  variant='destructive'
                                  onClick={() =>
                                    updateRegistrationStatus(
                                      registration.id,
                                      EventRegistrationStatus.REJECTED
                                    )
                                  }
                                  disabled={statusUpdateLoading}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {registration.status ===
                              EventRegistrationStatus.APPROVED && (
                              <Button
                                size='sm'
                                variant='default'
                                onClick={() =>
                                  updateRegistrationStatus(
                                    registration.id,
                                    EventRegistrationStatus.ATTENDED
                                  )
                                }
                                disabled={statusUpdateLoading}
                              >
                                Mark Attended
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
