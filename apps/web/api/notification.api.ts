import { nexusAxios } from '@/configs/axios.config';
import {
  Notification,
  NotificationPriority,
  NotificationStatus,
  NotificationTargetType,
  NotificationType,
  NotificationStats,
} from '@/types/notification.types';

export type CreateNotificationDto = {
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetType: NotificationTargetType;
  targetIds?: string[]; // For specific students
  scheduledAt?: string;
  metadata?: Record<string, any>;
};

export type UpdateNotificationDto = Partial<CreateNotificationDto>;

export type QueryNotificationDto = {
  searchTerm?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  targetType?: NotificationTargetType;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export const notificationApi = {
  getNotifications: async (params?: QueryNotificationDto) => {
    const response = await nexusAxios.get('/notifications', { params });
    return response.data;
  },

  getNotification: async (id: string) => {
    const response = await nexusAxios.get(`/notifications/${id}`);
    return response.data;
  },

  getNotificationStats: async () => {
    const response = await nexusAxios.get('/notifications/stats');
    console.log('Notification stats from API:', response.data);
    // Ensure all stats are numbers
    const stats = response.data;
    return {
      total: Number(stats.total) || 0,
      draft: Number(stats.draft) || 0,
      scheduled: Number(stats.scheduled) || 0,
      sent: Number(stats.sent) || 0,
      revoked: Number(stats.revoked) || 0,
      readRate:
        typeof stats.readRate === 'number' && !isNaN(stats.readRate)
          ? stats.readRate
          : 0,
    } as NotificationStats;
  },

  createNotification: async (data: CreateNotificationDto) => {
    const response = await nexusAxios.post('/notifications', data);
    return response.data;
  },

  updateNotification: async (id: string, data: UpdateNotificationDto) => {
    const response = await nexusAxios.put(`/notifications/${id}`, data);
    return response.data;
  },

  sendNotification: async (id: string) => {
    const response = await nexusAxios.post(`/notifications/${id}/send`);
    return response.data;
  },

  revokeNotification: async (id: string) => {
    const response = await nexusAxios.post(`/notifications/${id}/revoke`);
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await nexusAxios.delete(`/notifications/${id}`);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await nexusAxios.post(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await nexusAxios.post('/notifications/read-all');
    return response.data;
  },
};
