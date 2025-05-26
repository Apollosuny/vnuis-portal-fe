'use client';

import { Button } from '@workspace/ui/components/button';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import {
  BarChart4,
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  SquareStackIcon,
  User,
  DoorOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/router';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname.includes('/forms')) return 'forms';
    if (pathname.includes('/rooms')) return 'rooms';
    if (pathname.includes('/bookings')) return 'bookings';
    if (pathname.includes('/events')) return 'events';
    if (pathname.includes('/settings')) return 'settings';
    return 'overview';
  };

  const activeTab = getActiveTab();

  const handleNavigation = (tab: string) => {
    switch (tab) {
      case 'overview':
        router.push('/dashboard');
        break;
      case 'forms':
        router.push('/dashboard/forms');
        break;
      case 'rooms':
        router.push(ROUTES.ROOMS);
        break;
      case 'bookings':
        router.push('/dashboard'); // Update when bookings page is available
        break;
      case 'events':
        router.push(ROUTES.EVENTS); // Update when events page is available
        break;
      case 'settings':
        router.push('/dashboard'); // Update when settings page is available
        break;
    }
  };

  const getPageTitle = () => {
    if (title) return title;

    if (pathname.includes('/forms/create')) return 'Create Form';
    if (pathname.includes('/forms')) return 'Administrative Procedures';
    if (pathname.includes('/rooms')) return 'Room Management';
    if (pathname.includes('/bookings')) return 'Room Bookings';
    if (pathname.includes('/events')) return 'Events Management';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard Overview';
  };

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
              onClick={() => handleNavigation('overview')}
            />
            <SidebarItem
              icon={<FileText size={18} />}
              label='Forms'
              active={activeTab === 'forms'}
              onClick={() => handleNavigation('forms')}
            />
            <SidebarItem
              icon={<DoorOpen size={18} />}
              label='Rooms'
              active={activeTab === 'rooms'}
              onClick={() => handleNavigation('rooms')}
            />
            <SidebarItem
              icon={<Calendar size={18} />}
              label='Room Bookings'
              active={activeTab === 'bookings'}
              onClick={() => handleNavigation('bookings')}
            />
            <SidebarItem
              icon={<BarChart4 size={18} />}
              label='Events'
              active={activeTab === 'events'}
              onClick={() => handleNavigation('events')}
            />
          </div>
          <div className='p-2'>
            <SidebarItem
              icon={<Settings size={18} />}
              label='Settings'
              active={activeTab === 'settings'}
              onClick={() => handleNavigation('settings')}
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
              <h1 className='text-2xl font-semibold'>{getPageTitle()}</h1>
              <div className='flex items-center gap-2'>
                <Button variant='ghost' size='icon'>
                  <User size={20} />
                </Button>
              </div>
            </header>

            {/* Content */}
            <main className='flex-1 p-6 overflow-auto'>{children}</main>
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

export default DashboardLayout;
