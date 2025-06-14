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
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  PanelRightOpen,
  PanelRight,
  Bell,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { DecorativeShape } from '@/components/ui/decorative-shape';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/router';
import { useLogout } from '@/hooks/useLogout';
import { useUIStore } from '@/stores/ui.store';
import { SidebarToggle } from '@/components/ui/sidebar-toggle';
import { RightSidebarToggle } from '@/components/ui/right-sidebar-toggle';
import { useEffect } from 'react';
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
  const {
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
    isRightSidebarOpen,
    toggleRightSidebar,
    setRightSidebarOpen,
  } = useUIStore();

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
      toggleSidebar();
    }

    // Also close right sidebar on mobile when path changes
    if (isRightSidebarOpen && window.innerWidth < 768) {
      setRightSidebarOpen(false);
    }
  }, [
    pathname,
    isSidebarCollapsed,
    toggleSidebar,
    isRightSidebarOpen,
    setRightSidebarOpen,
  ]);

  const getActiveTab = () => {
    if (pathname.includes('/forms')) return 'forms';
    if (pathname.includes('/rooms')) return 'rooms';
    if (pathname.includes('/bookings')) return 'bookings';
    if (pathname.includes('/events')) return 'events';
    if (pathname.includes('/students')) return 'students';
    if (pathname.includes('/notifications')) return 'notifications';
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
      case 'notifications':
        router.push('/dashboard/admin/notifications');
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
    if (pathname.includes('/notifications')) return 'Notification Management';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard Overview';
  };

  return (
    <AuthenticatedGuard>
      <AnimatedBackground bubbleCount={20}>
        <motion.div
          className='flex h-screen w-full overflow-hidden'
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
            className={`h-full bg-sidebar flex flex-col text-sidebar-foreground border-r relative z-40 fixed md:relative ${
              isSidebarCollapsed ? 'w-20' : 'w-64'
            }`}
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
            <motion.div
              className={`p-4 border-b border-sidebar-border flex items-center justify-center !h-24 ${
                isSidebarCollapsed ? 'px-2' : ''
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div
                className={`relative h-12 rounded-lg overflow-hidden ${
                  isSidebarCollapsed ? 'w-full' : 'w-48'
                } float-animation pulse-border-animation`}
              >
                <Image
                  src='/assets/logos/logo.jpg'
                  alt='VirtuUni Nexus Logo'
                  fill
                  className={`object-contain glow-animation ${
                    theme === 'dark' ? 'filter invert' : ''
                  } ${isSidebarCollapsed ? 'scale-75' : ''}`}
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
                icon={
                  <AnimatedIcon
                    icon={<LayoutDashboard size={18} />}
                    animationType='pulse'
                  />
                }
                label='Overview'
                active={activeTab === 'overview'}
                onClick={() => handleNavigation('overview')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<FileText size={18} />}
                    animationType='bounce'
                  />
                }
                label='Forms'
                active={activeTab === 'forms'}
                onClick={() => handleNavigation('forms')}
              />
              {activeTab === 'forms' && !isSidebarCollapsed && (
                <div className='ml-6 space-y-1 mt-1'>
                  <SidebarItem
                    icon={
                      <AnimatedIcon
                        icon={<FileText size={16} />}
                        animationType='pulse'
                      />
                    }
                    label='All Forms'
                    active={pathname === '/dashboard/forms'}
                    onClick={() => router.push('/dashboard/forms')}
                    isSubItem
                  />
                  <SidebarItem
                    icon={
                      <AnimatedIcon
                        icon={<BadgeCheck size={16} />}
                        animationType='pulse'
                      />
                    }
                    label='Form Submissions'
                    active={pathname.includes('/dashboard/forms/submissions')}
                    onClick={() => router.push('/dashboard/forms/submissions')}
                    isSubItem
                  />
                </div>
              )}
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<DoorOpen size={18} />}
                    animationType='shake'
                  />
                }
                label='Rooms'
                active={activeTab === 'rooms'}
                onClick={() => handleNavigation('rooms')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<Calendar size={18} />}
                    animationType='bounce'
                  />
                }
                label='Room Bookings'
                active={activeTab === 'bookings'}
                onClick={() => handleNavigation('bookings')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<BarChart4 size={18} />}
                    animationType='bounce'
                  />
                }
                label='Events'
                active={activeTab === 'events'}
                onClick={() => handleNavigation('events')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<User size={18} />}
                    animationType='shake'
                  />
                }
                label='Students'
                active={pathname.includes('/dashboard/students')}
                onClick={() => router.push(ROUTES.STUDENTS)}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<Bell size={18} />}
                    animationType='pulse'
                  />
                }
                label='Notifications'
                active={activeTab === 'notifications'}
                onClick={() => handleNavigation('notifications')}
              />
            </motion.div>
            <motion.div
              className='p-2'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<Settings size={18} />}
                    animationType='spin'
                  />
                }
                label='Settings'
                active={activeTab === 'settings'}
                onClick={() => handleNavigation('settings')}
              />
              <SidebarItem
                icon={
                  <AnimatedIcon
                    icon={<LogOut size={18} />}
                    animationType='shake'
                  />
                }
                label='Logout'
                onClick={onLogout}
              />
            </motion.div>
          </motion.div>

          {/* Main content */}
          <motion.div
            className='flex-1 overflow-x-hidden overflow-y-auto bg-background'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className='flex flex-col h-full w-full'>
              {/* Header */}
              <motion.header
                className='border-b p-4 flex justify-between items-center backdrop-blur-sm bg-background/70 min-h-[5rem] shadow-sm !h-24'
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <div className='flex items-center gap-3 flex-grow'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='md:hidden flex-shrink-0'
                    onClick={toggleSidebar}
                  >
                    <Menu size={20} />
                  </Button>
                  <div className='flex items-center gap-2 min-w-0'>
                    <AnimatedIcon
                      icon={<Sparkles size={22} />}
                      animationType='pulse'
                      className='text-primary'
                    />
                    <motion.h1
                      className='text-2xl font-semibold text-nowrap'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                    >
                      {getPageTitle()}
                    </motion.h1>
                  </div>
                </div>
                <motion.div
                  className='flex items-center justify-center gap-3 flex-shrink-0 ml-4'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                >
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={toggleRightSidebar}
                    className='md:flex hidden'
                    title={
                      isRightSidebarOpen ? 'Close sidebar' : 'Open sidebar'
                    }
                  >
                    {isRightSidebarOpen ? (
                      <PanelRight size={20} />
                    ) : (
                      <PanelRightOpen size={20} />
                    )}
                  </Button>
                  <ThemeToggle />
                  <UserAvatar />
                </motion.div>
              </motion.header>

              {/* Content */}
              <motion.main
                className='flex-1 p-6 overflow-y-auto overflow-x-hidden relative'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                {/* Decorative shapes */}
                <DecorativeShape
                  variant='blob'
                  color='blue'
                  size='xl'
                  position='top-right'
                  className='translate-x-1/3 -translate-y-1/4 opacity-30'
                />
                <DecorativeShape
                  variant='ring'
                  color='purple'
                  size='lg'
                  position='bottom-left'
                  className='-translate-x-1/3 translate-y-1/4'
                />

                {/* Content */}
                <div className='relative z-10 w-full overflow-x-hidden max-w-full'>
                  {children}
                </div>
              </motion.main>
            </div>
          </motion.div>

          {/* Right Sidebar */}
          <AnimatePresence>
            {isRightSidebarOpen && (
              <motion.div
                className='fixed inset-0 bg-black/20 z-30 md:hidden'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setRightSidebarOpen(false)}
              />
            )}
          </AnimatePresence>

          <motion.div
            className={`h-full bg-sidebar flex flex-col text-sidebar-foreground border-l relative z-40 fixed right-0 md:relative ${
              isRightSidebarOpen ? 'w-64' : 'w-0'
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: isRightSidebarOpen ? 1 : 0,
              x: 0,
              width: isRightSidebarOpen ? '16rem' : '0', // 64 vs 0 in rem
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
                !isRightSidebarOpen && window.innerWidth < 768
                  ? 'translateX(100%)'
                  : 'translateX(0)',
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
          >
            <RightSidebarToggle className='hidden sm:block' />
            <motion.div
              className='p-4 border-b border-sidebar-border flex items-center justify-center h-24'
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <div className='text-lg font-semibold text-sidebar-foreground'>
                <AnimatedIcon
                  icon={<Sparkles size={22} />}
                  animationType='pulse'
                  className='text-primary inline-block mr-2'
                />
                Quick Info
              </div>
            </motion.div>

            <motion.div
              className='flex flex-col flex-1 p-4 gap-3 overflow-y-auto'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <div className='bg-sidebar-accent/10 p-4 rounded-lg border border-sidebar-border/30 shadow-sm'>
                <h3 className='text-sm font-medium mb-2 flex items-center'>
                  <Calendar size={16} className='mr-2 text-sidebar-primary' />{' '}
                  Today
                </h3>
                <p className='text-xs text-sidebar-muted'>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className='bg-sidebar-accent/10 p-4 rounded-lg border border-sidebar-border/30 shadow-sm'>
                <h3 className='text-sm font-medium mb-2 flex items-center'>
                  <FileText size={16} className='mr-2 text-sidebar-primary' />{' '}
                  Recent Forms
                </h3>
                <div className='space-y-2'>
                  <p className='text-xs text-sidebar-muted'>No recent forms</p>
                  {/* Will be populated with actual data later */}
                </div>
              </div>

              <div className='bg-sidebar-accent/10 p-4 rounded-lg border border-sidebar-border/30 shadow-sm'>
                <h3 className='text-sm font-medium mb-2 flex items-center'>
                  <BarChart4 size={16} className='mr-2 text-sidebar-primary' />{' '}
                  Statistics
                </h3>
                <div className='space-y-1 text-xs text-sidebar-muted'>
                  <p className='flex justify-between'>
                    <span>Forms:</span>
                    <span className='font-medium'>24</span>
                  </p>
                  <p className='flex justify-between'>
                    <span>Rooms:</span>
                    <span className='font-medium'>12</span>
                  </p>
                  <p className='flex justify-between'>
                    <span>Events:</span>
                    <span className='font-medium'>8</span>
                  </p>
                </div>
              </div>

              <div className='bg-sidebar-accent/10 p-4 rounded-lg border border-sidebar-border/30 shadow-sm'>
                <h3 className='text-sm font-medium mb-2 flex items-center'>
                  <BadgeCheck size={16} className='mr-2 text-sidebar-primary' />{' '}
                  Tasks
                </h3>
                <div className='space-y-2'>
                  <p className='text-xs text-sidebar-muted'>No pending tasks</p>
                  {/* Will be populated with actual data later */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatedBackground>
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
  const { isSidebarCollapsed } = useUIStore();

  return (
    <motion.div className={`relative ${active ? 'z-10' : 'z-0'}`} layout>
      <motion.button
        className={`flex items-center p-2 rounded-md w-full transition-all relative overflow-hidden ${
          active
            ? 'bg-sidebar-primary/15 text-sidebar-primary-foreground font-medium'
            : 'hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground'
        } ${isSidebarCollapsed && !isSubItem ? 'justify-center' : ''}`}
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 25,
        }}
      >
        <div
          className={`flex items-center w-full ${isSidebarCollapsed && !isSubItem ? 'justify-center' : ''}`}
        >
          <div
            className={`flex items-center justify-center ${active ? 'text-sidebar-primary-foreground' : ''}`}
            style={{ width: '24px', height: '24px', flexShrink: 0 }}
          >
            {icon}
          </div>
          {(!isSidebarCollapsed || isSubItem) && (
            <motion.span
              layout
              className='whitespace-nowrap origin-left ml-3'
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
          )}
        </div>
      </motion.button>
      {active && (
        <motion.div
          className={`absolute ${
            isSidebarCollapsed && !isSubItem
              ? 'bottom-1 left-1/2 w-10 h-1 -translate-x-1/2'
              : 'left-0 top-1/2 -translate-y-1/2 w-1.5 h-4/5'
          } bg-sidebar-primary rounded-full shadow-glow`}
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
    </motion.div>
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
