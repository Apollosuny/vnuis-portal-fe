'use client';

import { Button } from '@workspace/ui/components/button';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import Image from 'next/image';
import {
  BarChart4,
  BadgeCheck,
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  SquareStackIcon,
  User,
  DoorOpen,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/router';
import { useLogout } from '@/hooks/useLogout';
import { useUserStore } from '@/stores/user.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { UserAvatar } from '../ui/user-avatar';

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
  const { onLogout } = useLogout();
  const { theme } = useTheme();

  const getActiveTab = () => {
    if (pathname.includes('/forms')) return 'forms';
    if (pathname.includes('/rooms')) return 'rooms';
    if (pathname.includes('/bookings')) return 'bookings';
    if (pathname.includes('/events')) return 'events';
    if (pathname.includes('/students')) return 'students';
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
        router.push(ROUTES.ADMIN_BOOKINGS);
        break;
      case 'events':
        router.push(ROUTES.EVENTS); // Update when events page is available
        break;
      case 'students':
        router.push(ROUTES.STUDENTS);
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
    if (pathname.includes('/students')) return 'Student Management';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard Overview';
  };

  return (
    <AuthenticatedGuard>
      <motion.div
        className='flex h-screen w-full overflow-hidden'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Sidebar */}
        <motion.div
          className='h-full w-64 bg-sidebar flex flex-col text-sidebar-foreground border-r'
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
            className='p-4 border-b border-sidebar-border flex items-center justify-center h-24'
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
            className='flex flex-col flex-1 p-2 gap-1'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
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
            {activeTab === 'forms' && (
              <div className='ml-6 space-y-1 mt-1'>
                <SidebarItem
                  icon={<FileText size={16} />}
                  label='All Forms'
                  active={pathname === '/dashboard/forms'}
                  onClick={() => router.push('/dashboard/forms')}
                  isSubItem
                />
                <SidebarItem
                  icon={<BadgeCheck size={16} />}
                  label='Form Submissions'
                  active={pathname.includes('/dashboard/forms/submissions')}
                  onClick={() => router.push('/dashboard/forms/submissions')}
                  isSubItem
                />
              </div>
            )}
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
            <SidebarItem
              icon={<User size={18} />}
              label='Students'
              active={pathname.includes('/dashboard/students')}
              onClick={() => router.push(ROUTES.STUDENTS)}
            />
          </motion.div>
          <motion.div
            className='p-2'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <SidebarItem
              icon={<Settings size={18} />}
              label='Settings'
              active={activeTab === 'settings'}
              onClick={() => handleNavigation('settings')}
            />
            <SidebarItem
              icon={<LogOut size={18} />}
              label='Logout'
              onClick={onLogout}
            />
          </motion.div>
        </motion.div>

        {/* Main content */}
        <motion.div
          className='flex-1 overflow-auto bg-background'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className='flex flex-col h-full'>
            {/* Header */}
            <motion.header
              className='border-b p-4 flex justify-between items-center bg-background h-24'
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <motion.h1
                className='text-2xl font-semibold'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                {getPageTitle()}
              </motion.h1>
              <motion.div
                className='flex items-center gap-2'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <ThemeToggle />
                <UserAvatar />
              </motion.div>
            </motion.header>

            {/* Content */}
            <motion.main
              className='flex-1 p-6 overflow-auto'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {children}
            </motion.main>
          </div>
        </motion.div>
      </motion.div>
    </AuthenticatedGuard>
  );
};

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  isSubItem?: boolean;
}> = ({ icon, label, active, onClick, isSubItem }) => {
  return (
    <motion.button
      className={`flex items-center gap-2 p-2 rounded-md w-full text-left transition-colors cursor-pointer ${
        active
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 4 }}
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
      <motion.span layout>{label}</motion.span>
      {active && (
        <motion.div
          className='absolute left-0 w-1 h-6 bg-sidebar-primary-foreground rounded-full'
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

export default DashboardLayout;
