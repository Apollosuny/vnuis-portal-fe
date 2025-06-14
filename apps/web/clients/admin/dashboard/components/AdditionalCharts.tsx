'use client';

import { FC, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { DateTime } from 'luxon';
import { FormSubmissionStatus } from '@/types/enums';
import { RoomBookingStatus } from '@/types/room.types';
import { EventRegistrationStatus } from '@/types/event.types';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type AdditionalChartsProps = {
  formSubmissions: any[];
  bookings: any[];
  events: any[];
};

export const AdditionalCharts: FC<AdditionalChartsProps> = ({
  formSubmissions,
  bookings,
  events,
}) => {
  // Calculate monthly bookings for line chart
  const monthlyBookings = useMemo(() => {
    const monthsData: Record<string, number> = {};
    const now = DateTime.now();

    // Initialize the last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = now.minus({ months: i });
      const monthKey = monthDate.toFormat('MMM');
      monthsData[monthKey] = 0;
    }

    // Count bookings for each month
    bookings.forEach((booking) => {
      const createdDate = DateTime.fromISO(booking.createdAt);
      if (createdDate > now.minus({ months: 6 })) {
        const monthKey = createdDate.toFormat('MMM');
        if (monthsData[monthKey] !== undefined) {
          monthsData[monthKey]++;
        }
      }
    });

    return {
      months: Object.keys(monthsData),
      counts: Object.values(monthsData),
    };
  }, [bookings]);

  // Calculate weekly forms submissions for area chart
  const weeklyFormSubmissions = useMemo(() => {
    const weekData: Record<string, number> = {};
    const now = DateTime.now();

    // Initialize the last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekDate = now.minus({ weeks: i });
      const weekKey = `Week ${weekDate.weekNumber - now.minus({ weeks: 3 }).weekNumber + 1}`;
      weekData[weekKey] = 0;
    }

    // Count form submissions for each week
    formSubmissions.forEach((submission) => {
      const submissionDate = DateTime.fromISO(submission.createdAt);
      if (submissionDate > now.minus({ weeks: 4 })) {
        const weekNum = submissionDate.weekNumber;
        const weekKey = `Week ${weekNum - now.minus({ weeks: 3 }).weekNumber + 1}`;
        if (weekData[weekKey] !== undefined) {
          weekData[weekKey]++;
        }
      }
    });

    return {
      weeks: Object.keys(weekData),
      counts: Object.values(weekData),
    };
  }, [formSubmissions]);

  // Calculate event attendance for radar chart
  const eventTypeDistribution = useMemo(() => {
    let workshopCount = 0;
    let seminarCount = 0;
    let conferenceCount = 0;
    let meetingCount = 0;
    let otherCount = 0;

    events.forEach((event) => {
      const eventType = event.category || 'Other';
      if (eventType === 'Workshop') {
        workshopCount++;
      } else if (eventType === 'Seminar') {
        seminarCount++;
      } else if (eventType === 'Conference') {
        conferenceCount++;
      } else if (eventType === 'Meeting') {
        meetingCount++;
      } else {
        otherCount++;
      }
    });

    const types = ['Workshop', 'Seminar', 'Conference', 'Meeting', 'Other'];
    const counts = [
      workshopCount,
      seminarCount,
      conferenceCount,
      meetingCount,
      otherCount,
    ];

    return {
      types,
      counts,
    };
  }, [events]);

  // Calculate booking status distribution by day of week for column chart
  const bookingStatusByDayOfWeek = useMemo(() => {
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const statuses = [
      'PENDING',
      'APPROVED',
      'REJECTED',
      'CANCELLED',
      'COMPLETED',
    ];

    // Initialize counters for each status
    const pending = Array(7).fill(0);
    const approved = Array(7).fill(0);
    const rejected = Array(7).fill(0);
    const cancelled = Array(7).fill(0);
    const completed = Array(7).fill(0);

    // Count bookings for each day and status
    bookings.forEach((booking) => {
      if (!booking.createdAt) return;

      try {
        const bookingDate = DateTime.fromISO(booking.createdAt);
        if (!bookingDate.isValid) return;

        const dayIndex = (bookingDate.weekday - 1) % 7; // 1-7 to 0-6
        if (dayIndex < 0 || dayIndex >= 7) return;

        const status = booking.status || '';

        if (status === 'PENDING' || status === RoomBookingStatus.PENDING) {
          pending[dayIndex]++;
        } else if (
          status === 'APPROVED' ||
          status === RoomBookingStatus.APPROVED
        ) {
          approved[dayIndex]++;
        } else if (
          status === 'REJECTED' ||
          status === RoomBookingStatus.REJECTED
        ) {
          rejected[dayIndex]++;
        } else if (
          status === 'CANCELLED' ||
          status === RoomBookingStatus.CANCELLED
        ) {
          cancelled[dayIndex]++;
        } else if (status === 'COMPLETED') {
          completed[dayIndex]++;
        }
      } catch (e) {
        console.error('Error processing booking date:', e);
      }
    });

    // Format the data for the chart
    const series = [
      { name: 'PENDING', data: pending },
      { name: 'APPROVED', data: approved },
      { name: 'REJECTED', data: rejected },
      { name: 'CANCELLED', data: cancelled },
      { name: 'COMPLETED', data: completed },
    ];

    return { series, daysOfWeek };
  }, [bookings]);

  // Line chart options (Monthly Bookings Trend)
  const lineChartOptions: ApexOptions = {
    chart: {
      type: 'line',
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: ['#3B82F6'],
    xaxis: {
      categories: monthlyBookings.months,
      title: {
        text: 'Month',
      },
    },
    yaxis: {
      title: {
        text: 'Number of Bookings',
      },
    },
    markers: {
      size: 4,
      colors: ['#3B82F6'],
      strokeColors: '#fff',
      strokeWidth: 2,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} bookings`,
      },
    },
  };

  // Area chart options (Weekly Form Submissions)
  const areaChartOptions: ApexOptions = {
    chart: {
      type: 'area',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: ['#10B981'],
    xaxis: {
      categories: weeklyFormSubmissions.weeks,
      title: {
        text: 'Week',
      },
    },
    yaxis: {
      title: {
        text: 'Submissions',
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} submissions`,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
  };

  // Radar chart options (Event Type Distribution)
  const radarChartOptions: ApexOptions = {
    chart: {
      type: 'radar',
    },
    colors: ['#8B5CF6'],
    xaxis: {
      categories: eventTypeDistribution.types,
    },
    yaxis: {
      show: false,
    },
    markers: {
      size: 4,
    },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: '#e8e8e8',
          fill: {
            colors: ['#f8f8f8', '#fff'],
          },
        },
      },
    },
  };

  // Column chart options (Booking Status by Day of Week)
  const columnChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '70%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ['#FBBF24', '#34D399', '#F87171', '#6B7280', '#8B5CF6'],
    xaxis: {
      categories: bookingStatusByDayOfWeek.daysOfWeek,
      title: {
        text: 'Day of Week',
      },
    },
    yaxis: {
      title: {
        text: 'Number of Bookings',
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} bookings`,
      },
    },
    legend: {
      position: 'bottom',
    },
    stroke: {
      width: 1,
      colors: ['#fff'],
    },
    fill: {
      opacity: 1,
    },
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
      {/* Line Chart: Monthly Booking Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Booking Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={lineChartOptions}
            series={[{ name: 'Bookings', data: monthlyBookings.counts }]}
            type='line'
            height={350}
          />
        </CardContent>
      </Card>

      {/* Area Chart: Weekly Form Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={areaChartOptions}
            series={[
              { name: 'Submissions', data: weeklyFormSubmissions.counts },
            ]}
            type='area'
            height={350}
          />
        </CardContent>
      </Card>

      {/* Radar Chart: Event Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Event Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={radarChartOptions}
            series={[
              {
                name: 'Events',
                data: eventTypeDistribution.counts as number[],
              },
            ]}
            type='radar'
            height={350}
          />
        </CardContent>
      </Card>

      {/* Column Chart: Booking Status by Day of Week */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Activity by Day of Week</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={columnChartOptions}
            series={bookingStatusByDayOfWeek.series}
            type='bar'
            height={350}
          />
        </CardContent>
      </Card>
    </div>
  );
};
