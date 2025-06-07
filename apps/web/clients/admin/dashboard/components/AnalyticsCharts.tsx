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
      (booking) => booking.status === RoomBookingStatus.PENDING
    ).length,
    approved: bookings.filter(
      (booking) => booking.status === RoomBookingStatus.APPROVED
    ).length,
    rejected: bookings.filter(
      (booking) => booking.status === RoomBookingStatus.REJECTED
    ).length,
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

  // Bar chart options for room bookings
  const bookingChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: ['Pending', 'Approved', 'Rejected'],
    },
    colors: ['#FBBF24', '#34D399', '#F87171'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
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
              {
                name: 'Bookings',
                data: [
                  bookingStats.pending,
                  bookingStats.approved,
                  bookingStats.rejected,
                ],
              },
            ]}
            type='bar'
            height={350}
          />
        </CardContent>
      </Card>
    </div>
  );
};
