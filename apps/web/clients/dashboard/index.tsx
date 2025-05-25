'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { BarChart4, Calendar, FileText } from 'lucide-react';
import FormsPanel from '@/clients/dashboard/panels/forms-panel';
import BookingsPanel from '@/clients/dashboard/panels/bookings-panel';
import EventsPanel from '@/clients/dashboard/panels/events-panel';
import RoomsPanel from '@/clients/dashboard/panels/rooms-panel';
import DashboardLayout from '@/components/layouts/DashboardLayout';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const getCurrentContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel />;
      case 'forms':
        return <FormsPanel />;
      case 'rooms':
        return <RoomsPanel />;
      case 'bookings':
        return <BookingsPanel />;
      case 'events':
        return <EventsPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <OverviewPanel />;
    }
  };

  return <DashboardLayout>{getCurrentContent()}</DashboardLayout>;
};

const OverviewPanel: React.FC = () => {
  const stats = [
    {
      title: 'Pending Forms',
      value: 12,
      change: '+2',
      icon: <FileText className='text-primary' />,
    },
    {
      title: 'Pending Bookings',
      value: 8,
      change: '-1',
      icon: <Calendar className='text-blue-500' />,
    },
    {
      title: 'Upcoming Events',
      value: 5,
      change: '+3',
      icon: <BarChart4 className='text-emerald-500' />,
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className='p-6 flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>{stat.title}</p>
                <div className='flex items-baseline gap-2'>
                  <p className='text-3xl font-semibold'>{stat.value}</p>
                  <span
                    className={`text-xs ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className='p-3 rounded-full bg-primary/10'>{stat.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card className='md:col-span-1'>
          <CardHeader>
            <CardTitle>Recent Form Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className='flex items-center justify-between p-2 hover:bg-muted/40 rounded-md'
                >
                  <div className='flex items-center gap-2'>
                    <div className='size-2 rounded-full bg-amber-500' />
                    <span>Leave Request Form</span>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    2 hours ago
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className='md:col-span-1'>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='flex items-center justify-between p-2 hover:bg-muted/40 rounded-md'
                >
                  <div>
                    <div className='font-medium'>Orientation Day</div>
                    <div className='text-xs text-muted-foreground'>
                      May 28, 2025 • Lecture Hall A
                    </div>
                  </div>
                  <span className='text-xs text-muted-foreground'>
                    24 attendees
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SettingsPanel: React.FC = () => {
  return (
    <div className='max-w-2xl mx-auto'>
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-muted-foreground'>
            Settings panel content would go here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
