'use client';

import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import {
  BarChart4,
  Calendar,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  SquareStackIcon,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import FormsPanel from '@/clients/dashboard/panels/forms-panel';
import BookingsPanel from '@/clients/dashboard/panels/bookings-panel';
import EventsPanel from '@/clients/dashboard/panels/events-panel';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AuthenticatedGuard>
      <div className='flex h-screen w-full overflow-hidden'>
        {/* Sidebar */}
        <div className='h-full w-64 bg-sidebar flex flex-col text-sidebar-foreground border-r'>
          <div className='p-4 border-b border-sidebar-border flex items-center gap-2'>
            <SquareStackIcon className='size-6' />
            <h1 className='text-xl font-semibold'>VirtuUni Nexus</h1>
          </div>
          <div className='flex flex-col flex-1 p-2 gap-1'>
            <SidebarItem
              icon={<LayoutDashboard size={18} />}
              label='Overview'
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <SidebarItem
              icon={<FileText size={18} />}
              label='Forms'
              active={activeTab === 'forms'}
              onClick={() => setActiveTab('forms')}
            />
            <SidebarItem
              icon={<Calendar size={18} />}
              label='Room Bookings'
              active={activeTab === 'bookings'}
              onClick={() => setActiveTab('bookings')}
            />
            <SidebarItem
              icon={<BarChart4 size={18} />}
              label='Events'
              active={activeTab === 'events'}
              onClick={() => setActiveTab('events')}
            />
          </div>
          <div className='p-2'>
            <SidebarItem
              icon={<Settings size={18} />}
              label='Settings'
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
            />
            <SidebarItem
              icon={<LogOut size={18} />}
              label='Logout'
              onClick={() => console.log('logout')}
            />
          </div>
        </div>

        {/* Main content */}
        <div className='flex-1 overflow-auto bg-background'>
          <div className='flex flex-col h-full'>
            {/* Header */}
            <header className='border-b p-4 flex justify-between items-center bg-background'>
              <h1 className='text-2xl font-semibold'>
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'forms' && 'Administrative Procedures'}
                {activeTab === 'bookings' && 'Room Bookings'}
                {activeTab === 'events' && 'Events Management'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <div className='flex items-center gap-2'>
                <Button variant='ghost' size='icon'>
                  <User size={20} />
                </Button>
              </div>
            </header>

            {/* Content */}
            <main className='flex-1 p-6 overflow-auto'>
              {activeTab === 'overview' && <OverviewPanel />}
              {activeTab === 'forms' && <FormsPanel />}
              {activeTab === 'bookings' && <BookingsPanel />}
              {activeTab === 'events' && <EventsPanel />}
              {activeTab === 'settings' && <SettingsPanel />}
            </main>
          </div>
        </div>
      </div>
    </AuthenticatedGuard>
  );
};

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => {
  return (
    <button
      className={`flex items-center gap-2 p-2 rounded-md w-full text-left transition-colors ${
        active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div
          className='absolute left-0 w-1 h-6 bg-sidebar-primary-foreground rounded-full'
          layoutId='activeIndicator'
        />
      )}
    </button>
  );
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
