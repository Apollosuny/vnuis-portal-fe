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
  Bell,
  MessageSquare,
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
import { NotificationIcon } from '../notifications/NotificationIcon';
import { useNotifications } from '@/hooks/useNotifications';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { DecorativeShape } from '@/components/ui/decorative-shape';

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
    if (pathname.includes('/feedback')) return 'feedback';
    if (pathname.includes('/settings')) return 'settings';
    if (pathname.includes('/notifications')) return 'notifications';
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
      case 'feedback':
        router.push(ROUTES.STUDENT_FEEDBACK);
        break;
      case 'notifications':
        router.push(ROUTES.STUDENT_NOTIFICATIONS);
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
    if (pathname.includes('/feedback')) return 'Feedback Center';
    if (pathname.includes('/settings')) return 'Settings';
    if (pathname.includes('/notifications')) return 'Notifications';

    return 'Student Dashboard';
  };

  const getPageIcon = () => {
    if (pathname.includes('/forms'))
      return <FileText className='h-5 w-5 text-primary' />;
    if (pathname.includes('/rooms'))
      return <DoorOpen className='h-5 w-5 text-primary' />;
    if (pathname.includes('/bookings'))
      return <Clock className='h-5 w-5 text-primary' />;
    if (pathname.includes('/events'))
      return <Calendar className='h-5 w-5 text-primary' />;
    if (pathname.includes('/feedback'))
      return <MessageSquare className='h-5 w-5 text-primary' />;
    if (pathname.includes('/settings'))
      return <Settings className='h-5 w-5 text-primary' />;
    if (pathname.includes('/notifications'))
      return <Bell className='h-5 w-5 text-primary' />;

    // Default dashboard icon
    return <LayoutDashboard className='h-5 w-5 text-primary' />;
  };

  return (
    <AuthenticatedGuard>
      <AnimatedBackground bubbleCount={15}>
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

          {/* Decorative shapes */}
          <DecorativeShape
            variant='blob'
            color='blue'
            size='xl'
            position='bottom-right'
            className='opacity-20'
          />
          <DecorativeShape
            variant='circle'
            color='primary'
            size='lg'
            position='top-left'
            className='opacity-10'
          />

          {/* Sidebar */}
          <motion.div
            className={`bg-card shadow-md flex flex-col fixed md:relative z-40 h-full border-r`}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: 1,
              x: 0,
              width: isSidebarCollapsed ? '5rem' : '16rem', // 20 vs 64 in rem
              transition: {
                width: {
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                  duration: 0.3,
                },
              },
            }}
            style={{
              transform:
                isSidebarCollapsed && window.innerWidth < 768
                  ? 'translateX(-100%)'
                  : 'translateX(0)',
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
          >
            <SidebarToggle className='hidden sm:block' />
            <div className='flex sm:hidden absolute right-4 top-4'>
              <Button variant='ghost' size='icon' onClick={toggleSidebar}>
                <ChevronLeft size={18} />
              </Button>
            </div>
            <motion.div
              className={`px-6 py-5 border-b border-border flex items-center justify-center !h-24 ${isSidebarCollapsed ? 'px-2' : ''}`}
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div
                className={`relative h-12 ${isSidebarCollapsed ? 'w-full' : 'w-48'}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Image
                    src='/assets/logos/logo.jpg'
                    alt='VirtuUni Nexus Logo'
                    fill
                    className={`object-contain ${theme === 'dark' ? 'filter invert' : ''} ${isSidebarCollapsed ? 'scale-75' : ''}`}
                    priority
                  />
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              className='flex flex-col flex-1 py-6 space-y-1 px-3'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<LayoutDashboard size={20} />}
                    animationType='pulse'
                  />
                }
                label='Dashboard'
                active={activeTab === 'overview'}
                onClick={() => handleNavigation('overview')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<FileText size={20} />}
                    animationType='bounce'
                  />
                }
                label='Forms'
                active={activeTab === 'forms'}
                onClick={() => handleNavigation('forms')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<DoorOpen size={20} />}
                    animationType='pulse'
                  />
                }
                label='Room Directory'
                active={activeTab === 'rooms'}
                onClick={() => handleNavigation('rooms')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<Clock size={20} />}
                    animationType='bounce'
                  />
                }
                label='My Bookings'
                active={activeTab === 'bookings'}
                onClick={() => handleNavigation('bookings')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<Calendar size={20} />}
                    animationType='pulse'
                  />
                }
                label='Events'
                active={activeTab === 'events'}
                onClick={() => handleNavigation('events')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<MessageSquare size={20} />}
                    animationType='shake'
                  />
                }
                label='Feedback'
                active={activeTab === 'feedback'}
                onClick={() => handleNavigation('feedback')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<Bell size={20} />}
                    animationType='shake'
                  />
                }
                label='Notifications'
                active={activeTab === 'notifications'}
                onClick={() => handleNavigation('notifications')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<Settings size={20} />}
                    animationType='spin'
                  />
                }
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
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className='relative overflow-hidden rounded-md bg-gradient-to-r from-red-500/10 to-red-600/10'
              >
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/10'
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatType: 'mirror',
                    duration: 3,
                    ease: 'easeInOut',
                  }}
                />
                <Button
                  variant='ghost'
                  className={`w-full relative z-10 ${!isSidebarCollapsed ? 'justify-start' : 'justify-center'} font-medium text-red-500 hover:text-white hover:bg-red-500`}
                  onClick={onLogout}
                >
                  <motion.div
                    whileHover={{ rotate: [-5, 5, -5, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <LogOut
                      className={`${!isSidebarCollapsed ? 'mr-2' : ''} h-4 w-4`}
                    />
                  </motion.div>
                  {!isSidebarCollapsed && 'Logout'}
                </Button>
              </motion.div>
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
              className='bg-card shadow-sm py-4 px-6 flex items-center justify-between border-b border-border h-24'
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
                <motion.div
                  className='ml-2 hidden md:block'
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <DecorativeShape
                    variant='circle'
                    color='accent'
                    size='sm'
                    className='opacity-70'
                  />
                </motion.div>
              </motion.div>
              <motion.div
                className='flex items-center space-x-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <ThemeToggle />
                <NotificationIcon />
                <UserAvatar />
              </motion.div>
            </motion.header>

            {/* Main Content */}
            <motion.div
              className='flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/20 scrollbar-track-transparent'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <motion.div
                className='relative z-10'
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial='hidden'
                animate='show'
              >
                {children}
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatedBackground>
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
  const { unreadCount } = useNotifications();
  const hasNotifications = label === 'Notifications' && unreadCount > 0;

  return (
    <motion.button
      className={`flex items-center gap-3 p-2 rounded-md w-full text-left transition-all relative overflow-hidden ${
        active
          ? 'bg-primary/15 text-primary font-medium'
          : 'hover:bg-muted/50 hover:text-foreground'
      } ${isSidebarCollapsed && !isSubItem ? 'justify-center' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.02, x: isSidebarCollapsed ? 0 : 4 }}
      whileTap={{ scale: 0.97 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 25,
      }}
      layout
    >
      <div className='relative flex items-center justify-center'>
        <motion.span
          initial={{ scale: 1 }}
          animate={{
            scale: active ? 1.1 : 1,
            rotate: active ? 360 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
            duration: 0.35,
          }}
          className={`flex items-center justify-center ${active ? 'text-primary' : ''}`}
        >
          {icon}
        </motion.span>
        {isSidebarCollapsed && hasNotifications && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center'
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </div>
      {(!isSidebarCollapsed || isSubItem) && (
        <div className='flex items-center justify-center'>
          <motion.span
            layout
            className='whitespace-nowrap origin-left'
            initial={{ opacity: 0, x: -5 }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.3,
              delay: 0.05,
            }}
          >
            {label}
          </motion.span>
          {hasNotifications && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </div>
      )}
      {active && (
        <motion.div
          className={`absolute ${
            isSidebarCollapsed
              ? 'bottom-0 left-1/2 w-10 h-1 -translate-x-1/2'
              : 'left-0 top-1/2 -translate-y-1/2 w-1.5 h-4/5'
          } bg-primary rounded-full shadow-glow`}
          layoutId={isSubItem ? 'subItemActiveIndicator' : 'activeIndicator'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            duration: 0.3,
          }}
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
