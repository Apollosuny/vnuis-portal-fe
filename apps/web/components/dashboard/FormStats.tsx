import { FC } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import dynamic from 'next/dynamic';
import { FileText, Loader2 } from 'lucide-react';
import { ApexOptions } from 'apexcharts';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface FormStatsProps {
  submissionStats: {
    pending: number;
    completed: number;
  };
  submissionsByMonth?: { [key: string]: number };
  isLoading?: boolean;
}

export const FormStats: FC<FormStatsProps> = ({
  submissionStats,
  submissionsByMonth = {},
  isLoading = false,
}) => {
  // Bar chart options for monthly submissions
  const barChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%',
      },
    },
    colors: ['#2563eb'],
    xaxis: {
      categories: Object.keys(submissionsByMonth),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px',
        },
      },
    },
    grid: {
      show: true,
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      padding: {
        left: 0,
        right: 0,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: (value) => `${value} submissions`,
      },
    },
  };

  // Series data for monthly submissions
  const barChartSeries = [
    {
      name: 'Form Submissions',
      data: Object.values(submissionsByMonth),
    },
  ];

  // Donut chart options for submission status
  const donutChartOptions: ApexOptions = {
    chart: {
      type: 'donut',
      animations: {
        enabled: true,
        speed: 500,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350,
        },
      },
    },
    colors: ['#fbbf24', '#34d399'], // Yellow for pending, Green for completed
    labels: ['Pending', 'Completed'],
    legend: {
      position: 'bottom',
      fontSize: '14px',
      offsetY: 8,
      labels: {
        colors: '#6b7280',
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontFamily: 'inherit',
      },
    },
    tooltip: {
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: (value) => `${value} forms`,
      },
    },
  };

  // Series data for submission status
  const donutChartSeries = [submissionStats.pending, submissionStats.completed];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            Form Submissions
          </CardTitle>
        </CardHeader>
        <CardContent className='flex items-center justify-center min-h-[300px]'>
          <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 animate-spin text-primary' />
            <p className='text-sm text-muted-foreground'>
              Loading statistics...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='h-4 w-4' />
          Form Submissions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-8'>
          {/* Status Distribution Chart */}
          <div>
            <h4 className='text-sm font-medium text-muted-foreground mb-3'>
              Status Distribution
            </h4>
            <div className='h-[200px]'>
              <Chart
                options={donutChartOptions}
                series={donutChartSeries}
                type='donut'
                height='100%'
              />
            </div>
          </div>

          {/* Monthly Submissions Chart */}
          <div>
            <h4 className='text-sm font-medium text-muted-foreground mb-3'>
              Monthly Activity
            </h4>
            <div className='h-[200px]'>
              <Chart
                options={barChartOptions}
                series={barChartSeries}
                type='bar'
                height='100%'
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
