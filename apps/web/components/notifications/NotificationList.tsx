'use client';

import { Button } from '@workspace/ui/components/button';
import { Check, Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification, NotificationPriority } from '@/types/notification.types';
import { NotificationItem } from './NotificationItem';
import { ScrollArea } from '@workspace/ui/components/scroll-area';
import { cn } from '@workspace/ui/lib/utils';

interface NotificationListProps {
  closeFn: () => void;
  maxHeight?: string;
  fullPage?: boolean;
}

export const NotificationList = ({
  closeFn,
  maxHeight = 'max-h-[calc(100vh-300px)]',
  fullPage = false,
}: NotificationListProps) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAllAsRead,
    page,
    setPage,
    total,
    totalPages,
  } = useNotifications();

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`w-full ${fullPage ? 'h-full' : ''}`}>
      <div className='p-4 border-b border-border flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <Bell size={18} />
          <h3 className='font-semibold'>
            Notifications
            {unreadCount > 0 && (
              <span className='ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5'>
                {unreadCount} new
              </span>
            )}
          </h3>
        </div>

        {unreadCount > 0 && (
          <Button
            variant='ghost'
            size='sm'
            className='text-xs flex items-center gap-1'
            onClick={handleMarkAllAsRead}
          >
            <Check size={14} />
            Mark all as read
          </Button>
        )}
      </div>

      <ScrollArea className={cn(maxHeight, 'overflow-y-auto')}>
        <div className='min-h-[100px]'>
          {isLoading ? (
            <div className='flex justify-center items-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div>
              {notifications.map((notification: Notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  priorityColor={getPriorityColor(notification.priority)}
                  formattedDate={formatDate(
                    notification.sentAt || notification.createdAt
                  )}
                />
              ))}

              {/* Add pagination if we have more than 1 page */}
              {totalPages > 1 && (
                <div className='flex justify-center items-center gap-2 pt-4 mt-2 border-t'>
                  {page > 1 && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 px-2 text-xs'
                      onClick={() => setPage(page - 1)}
                    >
                      Prev
                    </Button>
                  )}

                  <div className='text-xs text-muted-foreground'>
                    Page {page} of {totalPages}
                  </div>

                  {page < totalPages && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 px-2 text-xs'
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className='py-8 px-4 text-center'>
              <Bell
                size={40}
                className='mx-auto mb-2 text-muted-foreground opacity-50'
              />
              <p className='text-muted-foreground'>No notifications</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {!fullPage && (
        <div className='sticky bottom-0 p-3 border-t border-border bg-card'>
          <Button
            variant='outline'
            size='sm'
            className='w-full text-xs'
            onClick={() => {
              closeFn();
              window.location.href = '/student-dashboard/notifications';
            }}
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
};
