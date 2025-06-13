'use client';

import { Button } from '@workspace/ui/components/button';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import Image from 'next/image';
import {
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  FileText,
  GraduationCap,
  DoorOpen,
  Clock,
  Calendar,
  Moon,
  Sun,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/router';
import { useLogout } from '@/hooks/useLogout';
import { useUIStore } from '@/stores/ui.store';
import { SidebarToggle } from '@/components/ui/sidebar-toggle';
import { UserAvatar } from '../ui/user-avatar';
import { useEffect } from 'react';

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
  const { isSidebarCollapsed, toggleSidebar, setSidebarCollapsed } =
    useUIStore();

  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  // Close sidebar on mobile devices when the path changes
  useEffect(() => {
    if (!isSidebarCollapsed && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, [pathname, isSidebarCollapsed, setSidebarCollapsed]);

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
        className='flex h-screen bg-background overflow-hidden'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Mobile Overlay */}
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.div
              className='fixed inset-0 bg-black/20 z-30 md:hidden'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-card shadow-md flex flex-col fixed md:relative z-40 h-full transition-all duration-300 ease-in-out ${isSidebarCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
            delay: 0.2,
          }}
        >
          <SidebarToggle className='hidden sm:block' />
          <div className='flex sm:hidden absolute right-4 top-4'>
            <Button variant='ghost' size='icon' onClick={toggleSidebar}>
              <ChevronLeft size={18} />
            </Button>
          </div>
          <motion.div
            className={`px-6 py-5 border-b border-border flex items-center justify-center h-24 ${isSidebarCollapsed ? 'px-2' : ''}`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <div
              className={`relative h-12 ${isSidebarCollapsed ? 'w-full' : 'w-48'}`}
            >
              <Image
                src='/assets/logos/logo.jpg'
                alt='VirtuUni Nexus Logo'
                fill
                className={`object-contain ${theme === 'dark' ? 'filter invert' : ''} ${isSidebarCollapsed ? 'scale-75' : ''}`}
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
              className={`w-full ${!isSidebarCollapsed ? 'justify-start' : 'justify-center'} text-red-500 hover:text-red-700 hover:bg-red-50/50`}
              onClick={onLogout}
            >
              <LogOut
                className={`${!isSidebarCollapsed ? 'mr-2' : ''} h-4 w-4`}
              />
              {!isSidebarCollapsed && 'Logout'}
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
              className='flex items-center gap-3'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Button
                variant='ghost'
                size='icon'
                className='md:hidden'
                onClick={toggleSidebar}
              >
                <Menu size={20} />
              </Button>
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
  isSubItem?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  onClick,
  isSubItem,
}) => {
  const { isSidebarCollapsed } = useUIStore();

  return (
    <motion.button
      className={`flex items-center gap-2 p-2 rounded-md w-full text-left transition-colors cursor-pointer ${
        active
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted/50 hover:text-foreground'
      } ${isSidebarCollapsed && !isSubItem ? 'justify-center' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.02, x: isSidebarCollapsed ? 0 : 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      layout
    >
      <motion.span
        initial={{ scale: 1 }}
        animate={{ scale: active ? 1.1 : 1, rotate: active ? 360 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.span>
      {(!isSidebarCollapsed || isSubItem) && (
        <motion.span layout>{label}</motion.span>
      )}
      {active && (
        <motion.div
          className={`absolute ${isSidebarCollapsed ? 'bottom-0 left-1/2 w-8 h-1 -translate-x-1/2' : 'left-0 w-1 h-6'} bg-primary rounded-full`}
          layoutId='activeIndicator'
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
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default StudentDashboardLayout;
