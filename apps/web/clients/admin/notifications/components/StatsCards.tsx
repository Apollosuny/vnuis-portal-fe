import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Bell, Send, Clock, Ban, TrendingUp } from 'lucide-react';
import { NotificationStats } from '@/types/notification.types';

interface StatsCardsProps {
  stats: NotificationStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>
            Total Notifications
          </CardTitle>
          <Bell className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{Number(stats.total) || 0}</div>
          <p className='text-xs text-muted-foreground'>All notifications</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Sent</CardTitle>
          <Send className='h-4 w-4 text-green-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>
            {Number(stats.sent) || 0}
          </div>
          <p className='text-xs text-muted-foreground'>Notifications sent</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Pending</CardTitle>
          <Clock className='h-4 w-4 text-yellow-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-yellow-600'>
            {(Number(stats.draft) || 0) + (Number(stats.scheduled) || 0)}
          </div>
          <p className='text-xs text-muted-foreground'>
            Draft: {Number(stats.draft) || 0}, Scheduled:{' '}
            {Number(stats.scheduled) || 0}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Revoked</CardTitle>
          <Ban className='h-4 w-4 text-red-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-red-600'>
            {Number(stats.revoked) || 0}
          </div>
          <p className='text-xs text-muted-foreground'>Revoked notifications</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Read Rate</CardTitle>
          <TrendingUp className='h-4 w-4 text-blue-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-blue-600'>
            {typeof stats.readRate === 'number' && !isNaN(stats.readRate)
              ? `${(stats.readRate * 100).toFixed(1)}%`
              : '0.0%'}
          </div>
          <p className='text-xs text-muted-foreground'>Students who read</p>
        </CardContent>
      </Card>
    </div>
  );
}
