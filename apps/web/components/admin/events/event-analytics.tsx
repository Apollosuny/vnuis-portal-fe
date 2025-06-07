'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@workspace/ui/components/card';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useMemo } from 'react';
import { Event, EventRegistrationStatus } from '@/types/event.types';
import {
  UsersIcon,
  CalendarIcon,
  CheckCircle2Icon,
  Users2Icon,
} from 'lucide-react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface EventAnalyticsProps {
  events: Event[];
}

export const EventAnalytics = ({ events }: EventAnalyticsProps) => {
  // Calculate overall statistics
  const statsData = useMemo(() => {
    const totalEvents = events.length;
    const publishedEvents = events.filter((event) => event.isPublished).length;
    const totalCapacity = events.reduce(
      (acc, event) => acc + (event.capacity || 0),
      0
    );
    const upcomingEvents = events.filter(
      (event) => new Date(event.startTime) > new Date()
    ).length;

    return {
      totalEvents,
      publishedEvents,
      totalCapacity,
      upcomingEvents,
    };
  }, [events]);

  const categoryStats = useMemo(() => {
    const stats = events.reduce(
      (acc, event) => {
        const category = event.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      categories: Object.keys(stats),
      series: Object.values(stats),
    };
  }, [events]);

  const registrationStatusStats = useMemo(() => {
    const stats = events.reduce(
      (acc, event) => {
        const registrations = event.registrations || [];
        registrations.forEach((reg) => {
          acc[reg.status] = (acc[reg.status] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      labels: Object.keys(stats),
      series: Object.values(stats),
    };
  }, [events]);

  const timelineStats = useMemo(() => {
    // Create a map of last 6 months
    const months = new Map();
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      months.set(monthKey, 0);
    }

    // Count events per month
    events.forEach((event) => {
      const month = new Date(event.startTime).toLocaleString('default', {
        month: 'short',
      });
      if (months.has(month)) {
        months.set(month, months.get(month) + 1);
      }
    });

    return {
      categories: Array.from(months.keys()),
      series: [
        {
          name: 'Events',
          data: Array.from(months.values()),
        },
      ],
    };
  }, [events]);

  // Chart options
  const pieChartOptions: ApexOptions = {
    chart: {
      type: 'pie',
    },
    labels: categoryStats.categories,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    colors: ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'],
  };

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
    xaxis: {
      categories: timelineStats.categories,
    },
    colors: ['#0ea5e9'],
  };

  const donutChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
    },
    labels: registrationStatusStats.labels,
    colors: [
      '#22c55e', // APPROVED - green
      '#f59e0b', // PENDING - amber
      '#ef4444', // REJECTED - red
      '#6b7280', // CANCELLED - gray
      '#0ea5e9', // ATTENDED - blue
    ],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  return (
    <div className='space-y-6'>
      {/* Stats Overview */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between space-x-4'>
              <div className='flex items-center space-x-4'>
                <CalendarIcon className='h-6 w-6 text-blue-500' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Total Events
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {statsData.totalEvents}
                  </h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between space-x-4'>
              <div className='flex items-center space-x-4'>
                <CheckCircle2Icon className='h-6 w-6 text-green-500' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Published Events
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {statsData.publishedEvents}
                  </h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between space-x-4'>
              <div className='flex items-center space-x-4'>
                <Users2Icon className='h-6 w-6 text-purple-500' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Total Capacity
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {statsData.totalCapacity}
                  </h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between space-x-4'>
              <div className='flex items-center space-x-4'>
                <UsersIcon className='h-6 w-6 text-orange-500' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Upcoming Events
                  </p>
                  <h3 className='text-2xl font-bold'>
                    {statsData.upcomingEvents}
                  </h3>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card className='col-span-1'>
          <CardHeader>
            <CardTitle>Events by Category</CardTitle>
            <CardDescription>
              Distribution of events across different categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={pieChartOptions}
              series={categoryStats.series}
              type='pie'
              height={300}
            />
          </CardContent>
        </Card>

        <Card className='col-span-1'>
          <CardHeader>
            <CardTitle>Registration Status</CardTitle>
            <CardDescription>Overview of registration statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={donutChartOptions}
              series={registrationStatusStats.series}
              type='donut'
              height={300}
            />
          </CardContent>
        </Card>

        <Card className='col-span-1 lg:col-span-1'>
          <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
            <CardDescription>Number of events over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={lineChartOptions}
              series={timelineStats.series}
              type='line'
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
