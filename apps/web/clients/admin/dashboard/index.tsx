'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EventRegistrationStatus, type Event } from '@/types/event.types';
import { roomBookingApi } from '@/api/room-booking.api';
import { getAllFormSubmissions } from '@/api/form-submission.api';
import { eventApi } from '@/api/event.api';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { cn } from '@workspace/ui/lib/utils';
import { buttonVariants } from '@workspace/ui/components/button';
import { FormSubmissionStatus } from '@/types/enums';
import { RoomBookingStatus } from '@/types/room.types';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DataTable } from '@/components/data-table';
import { StatsCard } from './components/StatsCard';
import { AnalyticsCharts } from './components/AnalyticsCharts';

// Format submission date
const formatSubmissionDate = (date: string) => {
  return DateTime.fromISO(date).toFormat('dd/MM/yyyy HH:mm');
};

// Format function to format event time
const formatEventTime = (startTime: string, endTime?: string) => {
  const start = DateTime.fromISO(startTime).toFormat('dd/MM/yyyy HH:mm');
  if (!endTime) return start;
  const end = DateTime.fromISO(endTime).toFormat('HH:mm');
  return `${start} - ${end}`;
};

export default function AdminDashboard() {
  // Fetch form submissions
  const { data: formSubmissions = [] } = useQuery({
    queryKey: ['formSubmissions'],
    queryFn: async () => {
      const data = await getAllFormSubmissions();
      return data;
    },
  });

  // Fetch events
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const data = await eventApi.getEvents({});
      return data;
    },
  });

  // Fetch room bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['roomBookings'],
    queryFn: async () => {
      const data = await roomBookingApi.getRoomBookings({});
      return data.data;
    },
  });

  // Calculate stats
  const pendingForms = formSubmissions.filter(
    (submission) => submission.status === FormSubmissionStatus.PENDING
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === RoomBookingStatus.PENDING
  ).length;

  const upcomingEvents = events.filter(
    (event: any) => DateTime.fromISO(event.startTime) > DateTime.now()
  ).length;

  // Get recent form submissions
  const recentFormSubmissions = formSubmissions
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Get upcoming events with their registration counts
  const upcomingEventsList = events
    .filter((event: any) => DateTime.fromISO(event.startTime) > DateTime.now())
    .sort(
      (a: any, b: any) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, 5);

  // Get recent room bookings
  const recentBookings = bookings
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className='container mx-auto py-6 space-y-6'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <StatsCard
            title='Pending Form Submissions'
            value={pendingForms}
            href='/admin-dashboard/forms'
          />
          <StatsCard
            title='Upcoming Events'
            value={upcomingEvents}
            href='/admin-dashboard/events'
          />
          <StatsCard
            title='Pending Room Bookings'
            value={pendingBookings}
            href='/admin-dashboard/rooms'
          />
        </div>

        {/* Analytics Charts */}
        <AnalyticsCharts
          formSubmissions={formSubmissions}
          bookings={bookings}
          events={events}
        />

        {/* Recent Form Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Form Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentFormSubmissions.length === 0 ? (
              <p className='text-center text-muted-foreground'>
                No recent form submissions
              </p>
            ) : (
              <DataTable
                data={recentFormSubmissions}
                columns={[
                  {
                    accessorKey: 'student',
                    header: 'Student',
                    cell: ({ row }) => {
                      const student = row.getValue('student') as {
                        firstName?: string;
                        lastName?: string;
                      } | null;
                      return student
                        ? `${student.firstName || ''} ${student.lastName || ''}`
                        : '-';
                    },
                  },
                  {
                    accessorKey: 'form.name',
                    header: 'Form',
                  },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => (
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          {
                            'bg-yellow-100 text-yellow-800':
                              row.getValue('status') ===
                              FormSubmissionStatus.PENDING,
                            'bg-green-100 text-green-800':
                              row.getValue('status') ===
                              FormSubmissionStatus.APPROVED,
                            'bg-red-100 text-red-800':
                              row.getValue('status') ===
                              FormSubmissionStatus.REJECTED,
                          }
                        )}
                      >
                        {row.getValue('status')}
                      </span>
                    ),
                  },
                  {
                    accessorKey: 'createdAt',
                    header: 'Submitted',
                    cell: ({ row }) =>
                      formatSubmissionDate(row.getValue('createdAt')),
                  },
                ]}
              />
            )}
          </CardContent>
          <CardFooter>
            <Link
              href='/admin-dashboard/forms'
              className={cn(buttonVariants({ variant: 'link' }))}
            >
              View All Form Submissions →
            </Link>
          </CardFooter>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEventsList.length === 0 ? (
              <p className='text-center text-muted-foreground'>
                No upcoming events
              </p>
            ) : (
              <DataTable
                data={upcomingEventsList}
                columns={[
                  {
                    accessorKey: 'name',
                    header: 'Event Name',
                  },
                  {
                    accessorKey: 'startTime',
                    header: 'Date & Time',
                    cell: ({ row }) =>
                      DateTime.fromISO(row.getValue('startTime')).toFormat(
                        'dd/MM/yyyy HH:mm'
                      ),
                  },
                  {
                    accessorKey: 'registrations',
                    header: 'Registrations',
                    cell: ({ row }) => {
                      const event = row.original as Event;
                      const approvedRegistrations =
                        event.registrations?.filter(
                          (reg) =>
                            reg.status === EventRegistrationStatus.APPROVED ||
                            reg.status === EventRegistrationStatus.ATTENDED
                        )?.length || 0;
                      return `${approvedRegistrations}/${event.capacity}`;
                    },
                  },
                  {
                    accessorKey: 'isPublished',
                    header: 'Status',
                    cell: ({ row }) => (
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          {
                            'bg-green-100 text-green-800':
                              row.getValue('isPublished'),
                            'bg-yellow-100 text-yellow-800':
                              !row.getValue('isPublished'),
                          }
                        )}
                      >
                        {row.getValue('isPublished') ? 'Published' : 'Draft'}
                      </span>
                    ),
                  },
                ]}
              />
            )}
          </CardContent>
          <CardFooter>
            <Link
              href='/admin-dashboard/events'
              className={cn(buttonVariants({ variant: 'link' }))}
            >
              View All Events →
            </Link>
          </CardFooter>
        </Card>

        {/* Recent Room Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Room Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className='text-center text-muted-foreground'>
                No recent room bookings
              </p>
            ) : (
              <DataTable
                data={recentBookings}
                columns={[
                  {
                    accessorKey: 'student',
                    header: 'Student',
                    cell: ({ row }) => {
                      const student = row.getValue('student') as {
                        firstName?: string;
                        lastName?: string;
                      } | null;
                      return student
                        ? `${student.firstName || ''} ${student.lastName || ''}`
                        : '-';
                    },
                  },
                  {
                    accessorKey: 'room.name',
                    header: 'Room',
                  },
                  {
                    accessorKey: 'startTime',
                    header: 'Date & Time',
                    cell: ({ row }) =>
                      DateTime.fromISO(row.getValue('startTime')).toFormat(
                        'dd/MM/yyyy HH:mm'
                      ),
                  },
                  {
                    accessorKey: 'status',
                    header: 'Status',
                    cell: ({ row }) => (
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          {
                            'bg-yellow-100 text-yellow-800':
                              row.getValue('status') ===
                              RoomBookingStatus.PENDING,
                            'bg-green-100 text-green-800':
                              row.getValue('status') ===
                              RoomBookingStatus.APPROVED,
                            'bg-red-100 text-red-800':
                              row.getValue('status') ===
                              RoomBookingStatus.REJECTED,
                          }
                        )}
                      >
                        {row.getValue('status')}
                      </span>
                    ),
                  },
                ]}
              />
            )}
          </CardContent>
          <CardFooter>
            <Link
              href='/admin-dashboard/rooms'
              className={cn(buttonVariants({ variant: 'link' }))}
            >
              View All Room Bookings →
            </Link>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
