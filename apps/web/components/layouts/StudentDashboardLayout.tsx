'use client';

import { Button } from '@workspace/ui/components/button';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import Image from 'next/image';
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
import { UserAvatar } from '../ui/user-avatar';

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
  const { theme } = useTheme();

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
      <motion.div
        className='flex h-screen bg-background'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Sidebar */}
        <motion.div
          className='w-64 bg-card shadow-md hidden md:flex flex-col'
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
            delay: 0.2,
          }}
        >
          <motion.div
            className='px-6 py-5 border-b border-border flex items-center justify-center h-24'
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <div className='relative h-12 w-48'>
              <Image
                src='/assets/logos/logo.jpg'
                alt='VirtuUni Nexus Logo'
                fill
                className={`object-contain ${theme === 'dark' ? 'filter invert' : ''}`}
                priority
              />
            </div>
          </motion.div>
          <motion.div
            className='flex flex-col flex-1 py-6 space-y-1 px-3'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
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
          </motion.div>
          <motion.div
            className='mt-auto p-4 border-t border-border'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Button
              variant='ghost'
              className='w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50/50'
              onClick={onLogout}
            >
              <LogOut className='mr-2 h-4 w-4' />
              Logout
            </Button>
          </motion.div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className='flex-1 flex flex-col overflow-hidden'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {/* Header */}
          <motion.header
            className='h-24 bg-card shadow-sm py-4 px-6 flex items-center justify-between border-b border-border'
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <motion.div
              className='flex items-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <motion.h1
                className='text-2xl font-semibold'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                {getPageTitle()}
              </motion.h1>
            </motion.div>
            <motion.div
              className='flex items-center space-x-4'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <ThemeToggle />
              <UserAvatar />
            </motion.div>
          </motion.header>

          {/* Page Content */}
          <motion.main
            className='flex-1 overflow-auto p-6 bg-background'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {children}
          </motion.main>
        </motion.div>
      </motion.div>
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
    <motion.button
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
        active
          ? 'text-primary bg-primary/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      layout
    >
      <motion.span
        className='mr-3'
        initial={{ scale: 1 }}
        animate={{ scale: active ? 1.1 : 1, rotate: active ? 360 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.span>
      <motion.span layout>{label}</motion.span>
      {active && (
        <motion.div
          layoutId='sidebar-indicator'
          className='absolute right-0 w-1 h-8 bg-primary rounded-l-md'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.button>
  );
};

// Theme toggle component
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button
        variant='ghost'
        size='icon'
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title='Toggle theme'
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: theme === 'dark' ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          {theme === 'dark' ? <Calendar size={20} /> : <Moon size={20} />}
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default StudentDashboardLayout;
