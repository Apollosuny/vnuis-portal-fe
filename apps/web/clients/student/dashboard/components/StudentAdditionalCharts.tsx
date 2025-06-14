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
import { AdministrativeProceduresFormSubmission } from '@/types/form-submission.types';
import { RoomBookingResponse } from '@/api/room-booking.api';
import { Book, Clock, Lightbulb, Activity } from 'lucide-react';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type StudentAdditionalChartsProps = {
  formSubmissions: AdministrativeProceduresFormSubmission[];
  bookings: RoomBookingResponse[];
};

export const StudentAdditionalCharts: FC<StudentAdditionalChartsProps> = ({
  formSubmissions,
  bookings,
}) => {
  // Calculate form submission timeline (last 3 months)
  const formSubmissionTimeline = useMemo(() => {
    const categories = [];
    const data = [];
    const now = DateTime.now();

    // Create data for the last 3 months broken down by weeks
    for (let i = 11; i >= 0; i--) {
      const weekStart = now.minus({ weeks: i });
      const weekEnd = weekStart.plus({ days: 6 });
      const label = `${weekStart.toFormat('dd/MM')} - ${weekEnd.toFormat('dd/MM')}`;
      categories.push(label);

      // Count submissions in this week
      const count = formSubmissions.filter((submission) => {
        const submissionDate = DateTime.fromISO(submission.createdAt);
        return submissionDate >= weekStart && submissionDate <= weekEnd;
      }).length;

      data.push(count);
    }

    return {
      categories,
      data,
    };
  }, [formSubmissions]);

  // Calculate weekly booking patterns
  const weeklyBookingPatterns = useMemo(() => {
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const bookingsByDay = new Array(7).fill(0);

    bookings.forEach((booking) => {
      if (booking.startTime) {
        const bookingDate = DateTime.fromISO(booking.startTime);
        // DateTime weekday is 1-7 where 1 is Monday and 7 is Sunday
        const dayIndex = bookingDate.weekday - 1;
        if (dayIndex >= 0 && dayIndex < 7) {
          bookingsByDay[dayIndex]++;
        }
      }
    });

    return {
      categories: daysOfWeek,
      data: bookingsByDay,
    };
  }, [bookings]);

  // Calculate study hours distribution
  const studyHoursDistribution = useMemo(() => {
    // Group bookings by time of day
    const morningCount = bookings.filter((booking) => {
      if (!booking.startTime) return false;
      const hour = DateTime.fromISO(booking.startTime).hour;
      return hour >= 6 && hour < 12;
    }).length;

    const afternoonCount = bookings.filter((booking) => {
      if (!booking.startTime) return false;
      const hour = DateTime.fromISO(booking.startTime).hour;
      return hour >= 12 && hour < 18;
    }).length;

    const eveningCount = bookings.filter((booking) => {
      if (!booking.startTime) return false;
      const hour = DateTime.fromISO(booking.startTime).hour;
      return hour >= 18 && hour < 24;
    }).length;

    return [morningCount, afternoonCount, eveningCount];
  }, [bookings]);

  // Calculate form submission success rate
  const formSuccessRate = useMemo(() => {
    if (formSubmissions.length === 0) return [0, 0, 0];

    const approved = formSubmissions.filter(
      (form) => form.status === FormSubmissionStatus.APPROVED
    ).length;

    const pending = formSubmissions.filter(
      (form) => form.status === FormSubmissionStatus.PENDING
    ).length;

    const rejected = formSubmissions.filter(
      (form) => form.status === FormSubmissionStatus.REJECTED
    ).length;

    return [approved, pending, rejected];
  }, [formSubmissions]);

  // Chart options for the form submission timeline
  const areaChartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: ['#8b5cf6'], // Purple color for the area chart
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: formSubmissionTimeline.categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '10px',
        },
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
  };

  // Chart options for the weekly booking patterns
  const barChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
        distributed: true,
      },
    },
    colors: [
      '#10b981',
      '#3b82f6',
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#f43f5e',
      '#f97316',
    ],
    legend: {
      show: false,
    },
    xaxis: {
      categories: weeklyBookingPatterns.categories,
      labels: {
        style: {
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Bookings',
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} bookings`,
      },
    },
  };

  // Chart options for study hours distribution
  const donutChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
    },
    labels: ['Morning (6-12)', 'Afternoon (12-18)', 'Evening (18-24)'],
    colors: ['#f59e0b', '#3b82f6', '#6b7280'],
    legend: {
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} hours`,
      },
    },
  };

  // Chart options for form submission success rate
  const radialBarChartOptions: ApexOptions = {
    chart: {
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '70%',
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: '14px',
            fontWeight: 600,
            offsetY: -10,
          },
          value: {
            show: true,
            fontSize: '16px',
            fontWeight: 400,
            offsetY: 5,
          },
        },
      },
    },
    colors: ['#10b981'],
    labels: ['Success Rate'],
    stroke: {
      lineCap: 'round',
    },
  };

  // Calculate the success rate percentage for the radial chart
  const successRatePercentage = useMemo(() => {
    if (formSubmissions.length === 0) return 0;
    const approved = formSuccessRate[0] || 0;
    return Math.round((approved / formSubmissions.length) * 100);
  }, [formSubmissions, formSuccessRate]);

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Form Submission Timeline */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-md font-medium'>
              Form Submission Timeline
            </CardTitle>
            <Activity className='h-4 w-4 text-primary' />
          </CardHeader>
          <CardContent>
            <Chart
              options={areaChartOptions}
              series={[
                {
                  name: 'Submissions',
                  data: formSubmissionTimeline.data,
                },
              ]}
              type='area'
              height={300}
            />
          </CardContent>
        </Card>

        {/* Weekly Booking Patterns */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-md font-medium'>
              Weekly Booking Patterns
            </CardTitle>
            <Clock className='h-4 w-4 text-primary' />
          </CardHeader>
          <CardContent>
            <Chart
              options={barChartOptions}
              series={[
                {
                  name: 'Bookings',
                  data: weeklyBookingPatterns.data,
                },
              ]}
              type='bar'
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Study Hours Distribution */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-md font-medium'>
              Study Hours Distribution
            </CardTitle>
            <Book className='h-4 w-4 text-primary' />
          </CardHeader>
          <CardContent>
            <Chart
              options={donutChartOptions}
              series={studyHoursDistribution}
              type='donut'
              height={300}
            />
          </CardContent>
        </Card>

        {/* Form Submission Success Rate */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-md font-medium'>
              Form Approval Rate
            </CardTitle>
            <Lightbulb className='h-4 w-4 text-primary' />
          </CardHeader>
          <CardContent>
            <Chart
              options={radialBarChartOptions}
              series={[successRatePercentage]}
              type='radialBar'
              height={300}
            />
            <div className='mt-4 grid grid-cols-3 gap-2 text-center'>
              <div>
                <p className='text-xs font-medium text-muted-foreground'>
                  Approved
                </p>
                <p className='text-lg font-bold text-green-600'>
                  {formSuccessRate[0]}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-muted-foreground'>
                  Pending
                </p>
                <p className='text-lg font-bold text-amber-600'>
                  {formSuccessRate[1]}
                </p>
              </div>
              <div>
                <p className='text-xs font-medium text-muted-foreground'>
                  Rejected
                </p>
                <p className='text-lg font-bold text-red-600'>
                  {formSuccessRate[2]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
