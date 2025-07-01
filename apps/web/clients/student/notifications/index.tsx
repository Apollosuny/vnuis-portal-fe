'use client';

import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';
import { StudentNotificationList } from '@/components/notifications/StudentNotificationList';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Button } from '@workspace/ui/components/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Bell,
} from 'lucide-react';
import {
  NotificationType,
  NotificationPriority,
  Notification,
} from '@/types/notification.types';
import { useState } from 'react';
import { useStudentNotifications } from '@/hooks/useStudentNotifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Placeholder close function that doesn't do anything since this is a full page
  const dummyClose = () => {};

  return (
    <StudentDashboardLayout title='Notifications'>
      <Card className='w-full shadow-sm'>
        <CardHeader className='pb-3 border-b'>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>

        <div className='px-6 py-4'>
          <Tabs
            defaultValue='all'
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='w-full sm:w-auto mb-4'>
              <TabsTrigger value='all'>All</TabsTrigger>
              <TabsTrigger value='general'>General</TabsTrigger>
              <TabsTrigger value='academic'>Academic</TabsTrigger>
              <TabsTrigger value='event'>Events</TabsTrigger>
              <TabsTrigger value='urgent'>Urgent</TabsTrigger>
            </TabsList>

            <TabsContent value='all' className='mt-0'>
              <CardContent className='px-0 pt-0'>
                <EnhancedStudentNotificationList
                  closeFn={dummyClose}
                  maxHeight='max-h-[600px]'
                  fullPage={true}
                />
              </CardContent>
            </TabsContent>

            <TabsContent value='general' className='mt-0'>
              <CardContent className='px-0 pt-0'>
                <EnhancedFilteredNotifications
                  type={NotificationType.GENERAL}
                />
              </CardContent>
            </TabsContent>

            <TabsContent value='academic' className='mt-0'>
              <CardContent className='px-0 pt-0'>
                <EnhancedFilteredNotifications
                  type={NotificationType.ACADEMIC}
                />
              </CardContent>
            </TabsContent>

            <TabsContent value='event' className='mt-0'>
              <CardContent className='px-0 pt-0'>
                <EnhancedFilteredNotifications type={NotificationType.EVENT} />
              </CardContent>
            </TabsContent>

            <TabsContent value='urgent' className='mt-0'>
              <CardContent className='px-0 pt-0'>
                <EnhancedFilteredNotifications type={NotificationType.URGENT} />
              </CardContent>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </StudentDashboardLayout>
  );
};

// Enhanced component with better pagination
const EnhancedStudentNotificationList = ({
  closeFn,
  maxHeight,
  fullPage,
  type,
}: {
  closeFn: () => void;
  maxHeight?: string;
  fullPage?: boolean;
  type?: NotificationType;
}) => {
  const [pageSize, setPageSize] = useState(10);

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAllAsRead,
    page,
    setPage,
    totalPages,
    currentPage,
    total,
    setLimit,
  } = useStudentNotifications(type);

  // Update limit when pageSize changes
  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number(newPageSize);
    setPageSize(size);
    setLimit(size);
    setPage(1); // Reset to first page when changing page size
  };

  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className='flex flex-col'>
      <div className='flex justify-between items-center mb-4'>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant='outline'
            size='sm'
            className='gap-2'
          >
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className='flex flex-col items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700'></div>
          <p className='text-sm text-gray-500 mt-2'>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-8'>
          <div className='rounded-full bg-gray-100 p-3'>
            <Bell size={24} className='text-gray-400' />
          </div>
          <p className='text-sm text-gray-500 mt-2'>No notifications yet</p>
        </div>
      ) : (
        <>
          <div className='rounded-md border mb-4 overflow-hidden'>
            <div className={fullPage ? maxHeight : 'max-h-[calc(100vh-300px)]'}>
              <div className='divide-y divide-border'>
                {notifications.map((notification: Notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    priorityColor={getPriorityColor(notification.priority)}
                    formattedDate={new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Pagination Controls */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between mt-4 space-x-2'>
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-muted-foreground'>
                  Showing {startIndex + 1} to{' '}
                  {Math.min(startIndex + pageSize, total)} of {total}{' '}
                  notifications
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className='w-[100px]'>
                    <SelectValue placeholder='Page size' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='5'>5 per page</SelectItem>
                    <SelectItem value='10'>10 per page</SelectItem>
                    <SelectItem value='20'>20 per page</SelectItem>
                    <SelectItem value='50'>50 per page</SelectItem>
                  </SelectContent>
                </Select>

                <nav className='flex items-center space-x-1'>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className='h-4 w-4' />
                    <span className='sr-only'>First page</span>
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className='h-4 w-4' />
                    <span className='sr-only'>Previous page</span>
                  </Button>
                  <div className='flex items-center justify-center text-sm font-medium px-4'>
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className='h-4 w-4' />
                    <span className='sr-only'>Next page</span>
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={() => setPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className='h-4 w-4' />
                    <span className='sr-only'>Last page</span>
                  </Button>
                </nav>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const EnhancedFilteredNotifications = ({
  type,
}: {
  type: NotificationType;
}) => {
  return (
    <EnhancedStudentNotificationList
      type={type}
      closeFn={() => {}}
      maxHeight='max-h-[600px]'
      fullPage={true}
    />
  );
};

// Helper function for priority colors
const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case NotificationPriority.CRITICAL:
      return 'bg-red-500';
    case NotificationPriority.HIGH:
      return 'bg-orange-500';
    case NotificationPriority.NORMAL:
      return 'bg-blue-500';
    case NotificationPriority.LOW:
      return 'bg-gray-500';
    default:
      return 'bg-blue-500';
  }
};

export default NotificationsPage;
