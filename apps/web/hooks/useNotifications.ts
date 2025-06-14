import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification.api';
import { useNotificationStore } from '@/stores/notification.store';
import { useUserStore } from '@/stores/user.store';
import {
  NotificationStatus,
  NotificationTargetType,
} from '@/types/notification.types';

export const useNotifications = () => {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
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
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const notifications = await notificationApi.getNotifications({
        status: NotificationStatus.SENT, // Only get sent notifications
      });

      // Filter notifications for this student
      return notifications.filter(
        (notification: any) =>
          notification.targetType === NotificationTargetType.ALL_STUDENTS ||
          (notification.targetType ===
            NotificationTargetType.SPECIFIC_STUDENTS &&
            notification.targetIds?.includes(user.id))
      );
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });

  // Update store when notifications data changes
  useQuery({
    queryKey: ['updateNotificationStore', notifications],
    queryFn: async () => {
      if (notifications && notifications.length > 0) {
        setNotifications(notifications);

        const unread = notifications.filter(
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
      storeMarkAsRead(notificationId);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all notifications as read
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: () => {
      return notificationApi.markAllAsRead();
    },
    onSuccess: () => {
      storeMarkAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications: notifications || storeNotifications,
    unreadCount: storeUnreadCount,
    isLoading,
    error,
    fetchNotifications: () => refetch(),
    markAsRead,
    markAllAsRead,
  };
};
