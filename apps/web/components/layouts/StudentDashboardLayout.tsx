'use client';

import { Button } from '@workspace/ui/components/button';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  Settings,
  User,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
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
    if (pathname.includes('/courses')) return 'courses';
    if (pathname.includes('/schedule')) return 'schedule';
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
      case 'courses':
        router.push('/student-dashboard/courses');
        break;
      case 'schedule':
        router.push('/student-dashboard/schedule');
        break;
      case 'events':
        router.push('/student-dashboard/events');
        break;
      case 'settings':
        router.push('/student-dashboard/settings');
        break;
    }
  };

  const getPageTitle = () => {
    if (title) return title;

    if (pathname.includes('/courses')) return 'My Courses';
    if (pathname.includes('/schedule')) return 'My Schedule';
    if (pathname.includes('/events')) return 'Events';
    if (pathname.includes('/settings')) return 'Settings';

    return 'Student Dashboard';
  };

  return (
    <AuthenticatedGuard>
      <div className='flex h-screen bg-gray-50'>
        {/* Sidebar */}
        <div className='w-64 bg-white shadow-md hidden md:flex flex-col'>
          <div className='px-6 py-5 border-b'>
            <h1 className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
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
              icon={<BookOpen size={20} />}
              label='My Courses'
              active={activeTab === 'courses'}
              onClick={() => handleNavigation('courses')}
            />
            <SidebarItem
              icon={<Calendar size={20} />}
              label='My Schedule'
              active={activeTab === 'schedule'}
              onClick={() => handleNavigation('schedule')}
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
          <div className='mt-auto p-4 border-t'>
            <Button
              variant='ghost'
              className='w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50'
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
          <header className='bg-white shadow-sm py-4 px-6 flex items-center justify-between'>
            <h1 className='text-2xl font-semibold text-gray-800'>
              {getPageTitle()}
            </h1>
            <div className='flex items-center space-x-4'>
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
          <main className='flex-1 overflow-auto p-6 bg-gray-50'>
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
          ? 'text-primary-600 bg-primary-50'
          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
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

export default StudentDashboardLayout;
