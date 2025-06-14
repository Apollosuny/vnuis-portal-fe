'use client';

import { FC } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { Award, ChevronUp, TrendingUp } from 'lucide-react';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

// This component would use real data in a production environment
// For now, we'll simulate some academic performance data
const mockGpaData = [
  { semester: 'Spring 2023', gpa: 3.2 },
  { semester: 'Fall 2023', gpa: 3.4 },
  { semester: 'Spring 2024', gpa: 3.6 },
  { semester: 'Fall 2024', gpa: 3.7 },
  { semester: 'Spring 2025', gpa: 3.8 },
];

const mockSubjectScores = [
  { subject: 'Mathematics', score: 85 },
  { subject: 'Programming', score: 92 },
  { subject: 'Data Science', score: 88 },
  { subject: 'Algorithms', score: 90 },
  { subject: 'Software Eng.', score: 95 },
];

const mockAttendanceData = [
  { month: 'Jan', attendance: 95 },
  { month: 'Feb', attendance: 98 },
  { month: 'Mar', attendance: 92 },
  { month: 'Apr', attendance: 96 },
  { month: 'May', attendance: 94 },
  { month: 'Jun', attendance: 90 },
];

export const AcademicPerformanceCharts: FC = () => {
  // Calculate overall GPA and improvement
  const currentGpa =
    mockGpaData && mockGpaData.length > 0
      ? (mockGpaData[mockGpaData.length - 1]?.gpa ?? 0)
      : 0;
  const previousGpa =
    mockGpaData && mockGpaData.length > 1
      ? (mockGpaData[mockGpaData.length - 2]?.gpa ?? currentGpa)
      : currentGpa;
  const gpaImprovement =
    previousGpa > 0 ? ((currentGpa - previousGpa) / previousGpa) * 100 : 0;

  // Calculate average attendance
  const averageAttendance =
    mockAttendanceData.reduce((sum, item) => sum + item.attendance, 0) /
    mockAttendanceData.length;

  // Chart options for GPA progression
  const gpaLineChartOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
      dropShadow: {
        enabled: true,
        top: 0,
        left: 0,
        blur: 3,
        opacity: 0.2,
      },
    },
    stroke: {
      width: 5,
      curve: 'smooth',
    },
    colors: ['#8b5cf6'], // Purple color for the line
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toString(),
      offsetY: -5,
      style: {
        fontSize: '10px',
        colors: ['#111'],
      },
      background: {
        enabled: true,
        borderRadius: 2,
        padding: 4,
        opacity: 0.9,
        borderWidth: 1,
        borderColor: '#fff',
      },
    },
    markers: {
      size: 5,
    },
    xaxis: {
      categories: mockGpaData.map((item) => item.semester),
    },
    yaxis: {
      title: {
        text: 'GPA',
      },
      min: 2.0,
      max: 4.0,
      tickAmount: 4,
    },
    tooltip: {
      y: {
        formatter: (val) => val.toFixed(1),
      },
    },
  };

  // Chart options for subject performance
  const radarChartOptions: ApexOptions = {
    chart: {
      type: 'radar',
      toolbar: {
        show: false,
      },
    },
    colors: ['#10b981'], // Green color for the radar chart
    markers: {
      size: 4,
      colors: ['#10b981'],
      strokeWidth: 2,
    },
    plotOptions: {
      radar: {
        size: 140,
        polygons: {
          strokeColors: '#e9e9e9',
          fill: {
            colors: ['#f8f8f8', '#fff'],
          },
        },
      },
    },
    xaxis: {
      categories: mockSubjectScores.map((item) => item.subject),
    },
    yaxis: {
      show: false,
      min: 0,
      max: 100,
    },
    dataLabels: {
      enabled: true,
      background: {
        enabled: true,
        borderRadius: 2,
      },
    },
  };

  // Chart options for attendance tracking
  const areaChartOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    colors: ['#3b82f6'], // Blue color for the area
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: mockAttendanceData.map((item) => item.month),
    },
    yaxis: {
      min: 80,
      max: 100,
      title: {
        text: 'Attendance (%)',
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val}%`,
      },
    },
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* GPA Overview Card */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-end justify-between'>
              <div>
                <div className='text-3xl font-bold'>
                  {currentGpa.toFixed(1)}
                </div>
                <div className='flex items-center text-xs text-green-600'>
                  <ChevronUp className='h-3 w-3 mr-1' />
                  <span>{gpaImprovement.toFixed(1)}%</span>
                  <span className='text-muted-foreground ml-1'>
                    from last semester
                  </span>
                </div>
              </div>
              <Award className='h-10 w-10 text-primary opacity-20' />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-end justify-between'>
              <div>
                <div className='text-3xl font-bold'>
                  {averageAttendance.toFixed(1)}%
                </div>
                <div className='text-xs text-muted-foreground'>
                  Last 6 months average
                </div>
              </div>
              <TrendingUp className='h-10 w-10 text-blue-500 opacity-20' />
            </div>
          </CardContent>
        </Card>

        {/* Credits Earned */}
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Credits Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-end justify-between'>
              <div>
                <div className='text-3xl font-bold'>86/120</div>
                <div className='text-xs text-muted-foreground'>
                  71.7% of graduation requirement
                </div>
              </div>
              <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold'>
                72%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* GPA Progression Chart */}
        <Card>
          <CardHeader>
            <CardTitle>GPA Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              options={gpaLineChartOptions}
              series={[
                {
                  name: 'GPA',
                  data: mockGpaData.map((item) => item.gpa),
                },
              ]}
              type='line'
              height={300}
            />
          </CardContent>
        </Card>

        {/* Subject Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              options={radarChartOptions}
              series={[
                {
                  name: 'Score',
                  data: mockSubjectScores.map((item) => item.score),
                },
              ]}
              type='radar'
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Attendance Tracking Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart
            options={areaChartOptions}
            series={[
              {
                name: 'Attendance',
                data: mockAttendanceData.map((item) => item.attendance),
              },
            ]}
            type='area'
            height={250}
          />
        </CardContent>
      </Card>
    </div>
  );
};
