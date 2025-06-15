'use client';

import { Button } from '@workspace/ui/components/button';
import { Notification, NotificationType } from '@/types/notification.types';
import { useNotifications } from '@/hooks/useNotifications';
import { useUserStore } from '@/stores/user.store';
import {
  Bell,
  FileText,
  Calendar,
  AlertCircle,
  Info,
  Check,
  CornerDownRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  priorityColor: string;
  formattedDate?: string;
}

export const NotificationItem = ({
  notification,
  priorityColor,
  formattedDate,
}: NotificationItemProps) => {
  const { markAsRead } = useNotifications();
  const { user } = useUserStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const isRead = notification.readBy?.includes(user?.id || '');

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ACADEMIC:
        return <FileText size={18} className='text-blue-500' />;
      case NotificationType.EVENT:
        return <Calendar size={18} className='text-green-500' />;
      case NotificationType.URGENT:
        return <AlertCircle size={18} className='text-red-500' />;
      case NotificationType.SYSTEM:
        return <Info size={18} className='text-purple-500' />;
      case NotificationType.GENERAL:
      default:
        return <Bell size={18} className='text-gray-500' />;
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isRead) {
      // Sử dụng markAsRead mutation từ React Query
      markAsRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        'p-4 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors',
        !isRead && 'bg-primary/5'
      )}
      onClick={handleToggleExpand}
      data-read={isRead ? 'true' : 'false'}
    >
      <div className='flex items-start gap-3'>
        <div
          className={cn(
            'p-2 rounded-lg bg-muted flex items-center justify-center'
          )}
        >
          {getNotificationIcon(notification.type)}
        </div>
        <div className='flex-1'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2'>
              <h4
                className={cn(
                  'font-medium text-sm',
                  !isRead && 'font-semibold'
                )}
              >
                {notification.title}
              </h4>
              {!isRead && (
                <span className='text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full'>
                  New
                </span>
              )}
              <span className={`w-2 h-2 rounded-full ${priorityColor}`}></span>
            </div>
            <span className='text-xs text-muted-foreground'>
              {formattedDate}
            </span>
          </div>

          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='text-sm text-foreground/80 mt-2'
            >
              <p className='text-sm leading-relaxed'>{notification.content}</p>

              {notification.metadata &&
                Object.keys(notification.metadata).length > 0 && (
                  <div className='mt-2 text-xs text-muted-foreground'>
                    {Object.entries(notification.metadata).map(
                      ([key, value]) => (
                        <div key={key} className='flex items-start gap-1 mt-1'>
                          <CornerDownRight
                            size={12}
                            className='mt-1 flex-shrink-0'
                          />
                          <span className='font-medium'>{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      )
                    )}
                  </div>
                )}

              {!isRead && (
                <div className='mt-3'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-xs flex items-center gap-1'
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    <Check size={12} />
                    Mark as read
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <p className='text-sm line-clamp-2 text-muted-foreground mt-1'>
              {notification.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
