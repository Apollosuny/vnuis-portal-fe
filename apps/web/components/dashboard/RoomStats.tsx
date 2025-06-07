import { FC } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import dynamic from 'next/dynamic';
import { DoorOpen } from 'lucide-react';
import { RoomBookingStatus } from '@/types/room.types';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RoomStatsProps {
  bookingStats: {
    thisWeek: number;
  };
  bookingsByStatus?: { [key in RoomBookingStatus]?: number };
}

export const RoomStats: FC<RoomStatsProps> = ({
  bookingStats,
  bookingsByStatus = {},
}) => {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'donut',
    },
    colors: ['#2563eb', '#16a34a', '#dc2626', '#6b7280'],
    labels: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
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
  };

  const chartSeries = [
    bookingsByStatus[RoomBookingStatus.PENDING] || 0,
    bookingsByStatus[RoomBookingStatus.APPROVED] || 0,
    bookingsByStatus[RoomBookingStatus.REJECTED] || 0,
    bookingsByStatus[RoomBookingStatus.CANCELLED] || 0,
  ];

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Room Bookings</CardTitle>
          <DoorOpen className='text-primary' />
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <p className='text-2xl font-bold'>{bookingStats.thisWeek}</p>
          <p className='text-sm text-muted-foreground'>Bookings this week</p>
        </div>

        {/* Chart */}
        <div className='mt-4 h-[250px]'>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type='donut'
            height={250}
          />
        </div>
      </CardContent>
    </Card>
  );
};
