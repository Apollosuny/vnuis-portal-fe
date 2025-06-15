import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification.api';
import { useUserStore } from '@/stores/user.store';
import { Notification, NotificationType } from '@/types/notification.types';
import { useState } from 'react';

export const useStudentNotifications = (type?: NotificationType) => {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch notifications using react-query with filtering by type and pagination
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['studentNotifications', user?.id, type, page, limit],
    queryFn: async () => {
      if (!user?.id) return { notifications: [], total: 0 };

      // Use the getMyNotifications endpoint which filters for the current user
      const notifications = await notificationApi.getMyNotifications({
        type: type, // Filter by notification type if provided
        page: page, // Current page
        limit: limit, // Items per page
      });

      // Check if API returns paginated response or just array
      if (
        notifications &&
        typeof notifications === 'object' &&
        'items' in notifications
      ) {
        return {
          notifications: notifications.items,
          total: notifications.total || 0,
          currentPage: notifications.page || page,
          totalPages:
            notifications.totalPages ||
            Math.ceil((notifications.total || 0) / limit),
        };
      }

      // If API doesn't return paginated structure yet, assume it's still returning array
      return {
        notifications: notifications || [],
        total: notifications?.length || 0,
        currentPage: page,
        totalPages: 1,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });

  // Get unread count
  const unreadCount =
    response?.notifications?.reduce(
      (count: number, notification: Notification) => {
        if (!notification.readBy?.includes(user?.id || '')) {
          return count + 1;
        }
        return count;
      },
      0
    ) || 0;

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['studentNotifications'] });
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Extract notification IDs to be marked as read
      const unreadNotificationIds =
        response?.notifications
          ?.filter(
            (notification: Notification) =>
              !notification.readBy?.includes(user?.id || '')
          )
          .map((notification: Notification) => notification.id) || [];

      await notificationApi.markAllAsRead(unreadNotificationIds);
      // Update cache
      queryClient.invalidateQueries({ queryKey: ['studentNotifications'] });
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  };

  // Function to manually fetch notifications
  const fetchNotifications = () => {
    return refetch();
  };

  return {
    notifications: response?.notifications || [],
    total: response?.total || 0,
    currentPage: response?.currentPage || page,
    totalPages: response?.totalPages || 1,
    page,
    limit,
    setPage,
    setLimit,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
