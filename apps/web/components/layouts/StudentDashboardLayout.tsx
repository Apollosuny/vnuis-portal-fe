'use client';

import { Button } from '@workspace/ui/components/button';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  Settings,
  User,
  FileText,
  GraduationCap,
  DoorOpen,
  Clock,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/router';
import { useLogout } from '@/hooks/useLogout';

interface StudentDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const StudentDashboardLayout: React.FC<StudentDashboardLayoutProps> = ({
  children,
  title,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { onLogout } = useLogout();

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
        router.push(ROUTES.STUDENT_DASHBOARD);
        break;
      case 'forms':
        router.push(ROUTES.STUDENT_FORMS);
        break;
      case 'rooms':
        router.push(ROUTES.STUDENT_ROOMS);
        break;
      case 'bookings':
        router.push(ROUTES.STUDENT_BOOKINGS);
        break;
      case 'events':
        router.push(ROUTES.STUDENT_EVENTS);
        break;
      case 'settings':
        router.push(ROUTES.STUDENT_SETTINGS);
        break;
    }
  };

  const getPageTitle = () => {
    if (title) return title;

    if (pathname.includes('/forms')) return 'Administrative Forms';
    if (pathname.includes('/rooms')) return 'Room Directory';
    if (pathname.includes('/bookings')) return 'My Bookings';
    if (pathname.includes('/events')) return 'Event Registration';
    if (pathname.includes('/settings')) return 'Settings';

    return 'Student Dashboard';
  };

  return (
    <AuthenticatedGuard>
      <div className='flex h-screen bg-background'>
        {/* Sidebar */}
        <div className='w-64 bg-card shadow-md hidden md:flex flex-col'>
          <div className='px-6 py-5 border-b border-border'>
            <h1 className='text-xl font-semibold text-foreground flex items-center gap-2'>
              <GraduationCap className='text-primary' />
              Student Portal
            </h1>
          </div>
          <div className='flex flex-col flex-1 py-6 space-y-1 px-3'>
            <SidebarItem
              icon={<LayoutDashboard size={20} />}
              label='Dashboard'
              active={activeTab === 'overview'}
              onClick={() => handleNavigation('overview')}
            />
            <SidebarItem
              icon={<FileText size={20} />}
              label='Forms'
              active={activeTab === 'forms'}
              onClick={() => handleNavigation('forms')}
            />
            <SidebarItem
              icon={<DoorOpen size={20} />}
              label='Room Directory'
              active={activeTab === 'rooms'}
              onClick={() => handleNavigation('rooms')}
            />
            <SidebarItem
              icon={<Clock size={20} />}
              label='My Bookings'
              active={activeTab === 'bookings'}
              onClick={() => handleNavigation('bookings')}
            />
            <SidebarItem
              icon={<Calendar size={20} />}
              label='Events'
              active={activeTab === 'events'}
              onClick={() => handleNavigation('events')}
            />
            <SidebarItem
              icon={<Settings size={20} />}
              label='Settings'
              active={activeTab === 'settings'}
              onClick={() => handleNavigation('settings')}
            />
          </div>
          <div className='mt-auto p-4 border-t border-border'>
            <Button
              variant='ghost'
              className='w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50/50'
              onClick={onLogout}
            >
              <LogOut className='mr-2 h-4 w-4' />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          {/* Header */}
          <header className='bg-card shadow-sm py-4 px-6 flex items-center justify-between border-b border-border'>
            <h1 className='text-2xl font-semibold text-foreground'>
              {getPageTitle()}
            </h1>
            <div className='flex items-center space-x-4'>
              <ThemeToggle />
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full w-10 h-10'
              >
                <User size={20} />
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className='flex-1 overflow-auto p-6 bg-background'>
            {children}
          </main>
        </div>
      </div>
    </AuthenticatedGuard>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <button
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
        active
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
      onClick={onClick}
    >
      <span className='mr-3'>{icon}</span>
      {label}
      {active && (
        <motion.div
          layoutId='sidebar-indicator'
          className='absolute right-0 w-1 h-8 bg-primary rounded-l-md'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </button>
  );
};

// Theme toggle component
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title='Toggle theme'
    >
      {theme === 'dark' ? <Calendar size={20} /> : <Moon size={20} />}
    </Button>
  );
};

export default StudentDashboardLayout;
