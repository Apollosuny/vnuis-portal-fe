'use client';

import { Button } from '@workspace/ui/components/button';
import { Check, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStudentNotifications } from '@/hooks/useStudentNotifications';
import {
  Notification,
  NotificationPriority,
  NotificationType,
} from '@/types/notification.types';
import { NotificationItem } from './NotificationItem';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';

interface StudentNotificationListProps {
  closeFn: () => void;
  maxHeight?: string;
  fullPage?: boolean;
  type?: NotificationType;
}

export const StudentNotificationList = ({
  closeFn,
  maxHeight = 'max-h-[calc(100vh-300px)]',
  fullPage = false,
  type,
}: StudentNotificationListProps) => {
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
  } = useStudentNotifications(type);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

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

  return (
    <div className='flex flex-col'>
      <div className='flex justify-between items-center mb-4'>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant='outline'
            size='sm'
            className='gap-2'
          >
            <Check size={16} />
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
            <ScrollArea className={cn(fullPage ? maxHeight : '')}>
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
            </ScrollArea>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center mt-4 space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage(page > 1 ? page - 1 : 1)}
                disabled={page === 1}
                className='flex items-center gap-1'
              >
                <ChevronLeft size={16} />
                Prev
              </Button>

              <div className='text-sm'>
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setPage(page < totalPages ? page + 1 : totalPages)
                }
                disabled={page === totalPages}
                className='flex items-center gap-1'
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
