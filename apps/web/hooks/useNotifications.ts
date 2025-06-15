import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification.api';
import { useNotificationStore } from '@/stores/notification.store';
import { useUserStore } from '@/stores/user.store';
import {
  NotificationStatus,
  NotificationTargetType,
} from '@/types/notification.types';
import { useState } from 'react';

export const useNotifications = () => {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const {
    notifications: storeNotifications,
    unreadCount: storeUnreadCount,
    setNotifications,
    setUnreadCount,
    markAsRead: storeMarkAsRead,
    markAllAsRead: storeMarkAllAsRead,
  } = useNotificationStore();

  // Fetch notifications using react-query
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', user?.id, page, limit],
    queryFn: async () => {
      if (!user?.id) return [];

      // Use the getMyNotifications endpoint with pagination parameters
      const notifications = await notificationApi.getMyNotifications({
        page,
        limit,
      });
      return notifications;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });

  // Update store when notifications data changes
  useQuery({
    queryKey: ['updateNotificationStore', notifications],
    queryFn: async () => {
      if (notifications) {
        // Handle different response structures
        const notificationItems = Array.isArray(notifications)
          ? notifications
          : notifications.items || [];

        setNotifications(notificationItems);

        // Calculate unread notifications
        const unread = notificationItems.filter(
          (notification: any) => !notification.readBy?.includes(user?.id)
        ).length;

        setUnreadCount(unread);
      }
      return null;
    },
    enabled: !!notifications,
  });

  // Mark a notification as read
  const { mutate: markAsRead } = useMutation({
    mutationFn: (notificationId: string) => {
      return notificationApi.markAsRead(notificationId);
    },
    onSuccess: (_, notificationId) => {
      // Pass the current user ID to ensure proper UI update
      storeMarkAsRead(notificationId);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all notifications as read
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: () => {
      // Extract notification IDs to be marked as read
      const notificationItems = notifications
        ? Array.isArray(notifications)
          ? notifications
          : notifications.items || []
        : [];

      // Filter for unread notifications
      const unreadNotificationIds = notificationItems
        .filter(
          (notification: any) => !notification.readBy?.includes(user?.id || '')
        )
        .map((notification: any) => notification.id);

      // Call API with these IDs
      return notificationApi.markAllAsRead(unreadNotificationIds);
    },
    onSuccess: () => {
      storeMarkAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Extract notification items based on the structure
  const notificationItems = notifications
    ? Array.isArray(notifications)
      ? notifications
      : notifications.items || []
    : storeNotifications;

  // Extract pagination data if available
  const paginationData =
    notifications && !Array.isArray(notifications)
      ? {
          total: notifications.total || notificationItems.length,
          page: notifications.page || 1,
          totalPages: notifications.totalPages || 1,
        }
      : { total: notificationItems.length, page: 1, totalPages: 1 };

  return {
    notifications: notificationItems,
    ...paginationData,
    unreadCount: storeUnreadCount,
    isLoading,
    error,
    page,
    limit,
    setPage,
    setLimit,
    fetchNotifications: () => refetch(),
    markAsRead,
    markAllAsRead,
  };
};
