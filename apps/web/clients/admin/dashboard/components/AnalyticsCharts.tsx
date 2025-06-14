'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { RoomBookingStatus } from '@/types/room.types';
import { FormSubmissionStatus } from '@/types/enums';
import { EventRegistrationStatus } from '@/types/event.types';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type AnalyticsChartsProps = {
  formSubmissions: any[];
  bookings: any[];
  events: any[];
};

export const AnalyticsCharts = ({
  formSubmissions,
  bookings,
  events,
}: AnalyticsChartsProps) => {
  // Log bookings to check their structure
  console.log('Bookings data:', bookings);
  console.log(
    'Bookings with APPROVED status:',
    bookings.filter((booking) => booking.status === 'APPROVED')
  );
  // Calculate form submissions by status
  const formStats = {
    pending: formSubmissions.filter(
      (form) => form.status === FormSubmissionStatus.PENDING
    ).length,
    approved: formSubmissions.filter(
      (form) => form.status === FormSubmissionStatus.APPROVED
    ).length,
    rejected: formSubmissions.filter(
      (form) => form.status === FormSubmissionStatus.REJECTED
    ).length,
  };

  // Calculate room bookings by status
  const bookingStats = {
    pending: bookings.filter(
      (booking) =>
        booking.status === RoomBookingStatus.PENDING ||
        booking.status === 'PENDING'
    ).length,
    approved: bookings.filter(
      (booking) =>
        booking.status === RoomBookingStatus.APPROVED ||
        booking.status === 'APPROVED'
    ).length,
    rejected: bookings.filter(
      (booking) =>
        booking.status === RoomBookingStatus.REJECTED ||
        booking.status === 'REJECTED'
    ).length,
    cancelled: bookings.filter(
      (booking) =>
        booking.status === RoomBookingStatus.CANCELLED ||
        booking.status === 'CANCELLED'
    ).length,
    completed: bookings.filter((booking) => booking.status === 'COMPLETED')
      .length,
  };

  // Calculate event registrations
  const eventStats = events.reduce(
    (acc, event) => {
      const totalRegistrations = event.registrations?.length || 0;
      acc.total += totalRegistrations;
      acc.approved +=
        event.registrations?.filter(
          (reg: any) => reg.status === EventRegistrationStatus.APPROVED
        ).length || 0;
      return acc;
    },
    { total: 0, approved: 0 }
  );

  // Donut chart options for form submissions
  const formChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
    },
    labels: ['Pending', 'Approved', 'Rejected'],
    colors: ['#FBBF24', '#34D399', '#F87171'],
    legend: {
      position: 'bottom',
    },
  };

  // Donut chart options for room bookings
  const bookingChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
    },
    labels: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'],
    colors: ['#FBBF24', '#34D399', '#F87171', '#6B7280', '#8B5CF6'],
    legend: {
      position: 'bottom',
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} bookings`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
        },
      },
    },
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      {/* Form Submissions Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Form Submissions by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={formChartOptions}
            series={[formStats.pending, formStats.approved, formStats.rejected]}
            type='donut'
            height={350}
          />
        </CardContent>
      </Card>

      {/* Room Bookings Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Room Bookings Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={bookingChartOptions}
            series={[
              bookingStats.pending,
              bookingStats.approved,
              bookingStats.rejected,
              bookingStats.cancelled,
              bookingStats.completed,
            ]}
            type='donut'
            height={350}
          />
          {/* Debug information */}
          <div className='mt-4 text-xs text-muted-foreground'>
            <p>Pending: {bookingStats.pending}</p>
            <p>Approved: {bookingStats.approved}</p>
            <p>Rejected: {bookingStats.rejected}</p>
            <p>Cancelled: {bookingStats.cancelled}</p>
            <p>Completed: {bookingStats.completed}</p>
            <p>Total Bookings: {bookings.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
