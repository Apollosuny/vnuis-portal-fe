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
  take?: number;
  skip?: number;
};

export const notificationApi = {
  getNotifications: async (params?: QueryNotificationDto) => {
    const response = await nexusAxios.get('/notifications', { params });

    // Ensure we have proper data
    if (Array.isArray(response.data)) {
      const processedData = response.data.map((notification: any) => {
        // Process type field (ensure uppercase)
        let type = notification.type;
        if (type && typeof type === 'string') {
          type = type.toUpperCase();
          // If type is not a valid enum value, use default
          if (!Object.values(NotificationType).includes(type)) {
            type = NotificationType.GENERAL;
          }
        } else {
          type = NotificationType.GENERAL;
        }

        // Process priority field (ensure uppercase)
        let priority = notification.priority;
        if (priority && typeof priority === 'string') {
          priority = priority.toUpperCase();
          // If priority is not a valid enum value, use default
          if (!Object.values(NotificationPriority).includes(priority)) {
            priority = NotificationPriority.NORMAL;
          }
        } else {
          priority = NotificationPriority.NORMAL;
        }

        // Process status field (ensure uppercase)
        let status = notification.status;
        if (status && typeof status === 'string') {
          status = status.toUpperCase();
          // If status is not a valid enum value, use default
          if (!Object.values(NotificationStatus).includes(status)) {
            status = NotificationStatus.DRAFT;
          }
        } else {
          status = NotificationStatus.DRAFT;
        }

        // Return the processed notification
        return {
          ...notification,
          type,
          priority,
          status,
        };
      });

      console.log('Processed notification data:', processedData);
      return processedData;
    }

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

  markAllAsRead: async (notificationIds: string[] = []) => {
    // If we have specific notification IDs, mark them as read one by one
    if (notificationIds.length > 0) {
      const promises = notificationIds.map((id) =>
        nexusAxios.post(`/notifications/${id}/read`)
      );
      const responses = await Promise.all(promises);
      return responses.map((response) => response.data);
    }

    // If no specific IDs provided, try to use the bulk endpoint or fallback to individual requests
    try {
      // First try the bulk endpoint
      const response = await nexusAxios.post('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.warn(
        'Bulk read endpoint not available, consider implementing it in backend'
      );
      // Could implement fallback to individually mark each notification
      return {
        message: 'Please implement /notifications/read-all endpoint in backend',
      };
    }
  },

  getMyNotifications: async (params?: QueryNotificationDto) => {
    // Format parameters for backend API
    // Convert page/limit to take/skip as needed by backend
    // Convert pagination params
    const apiParams: QueryNotificationDto = { ...params };
    if (params?.page && params?.limit) {
      // If backend uses skip/take instead of page/limit
      apiParams.take = params.limit;
      apiParams.skip = (params.page - 1) * params.limit;
    }

    const response = await nexusAxios.get('/notifications/me', {
      params: apiParams,
    });

    // Process response data
    let items = [];
    let totalItems = 0;
    let totalPages = 1;
    let currentPage = params?.page || 1;

    // Check if response is paginated or array
    if (
      response.data &&
      typeof response.data === 'object' &&
      'items' in response.data
    ) {
      // Already paginated response
      items = response.data.items || [];
      totalItems = response.data.total || items.length;
      totalPages =
        response.data.totalPages ||
        Math.ceil(totalItems / (params?.limit || 10));
      currentPage = response.data.page || currentPage;
    } else if (Array.isArray(response.data)) {
      // Array response - process all items
      items = response.data;
      totalItems = items.length;
      totalPages = Math.ceil(totalItems / (params?.limit || 10));
    } else {
      // Unexpected response format
      console.error('Unexpected API response format:', response.data);
      return [];
    }

    // Process items
    const processedData = items.map((notification: any) => {
      // Process type field (ensure uppercase)
      let type = notification.type;
      if (type && typeof type === 'string') {
        type = type.toUpperCase();
        if (!Object.values(NotificationType).includes(type)) {
          type = NotificationType.GENERAL;
        }
      } else {
        type = NotificationType.GENERAL;
      }

      // Process priority field (ensure uppercase)
      let priority = notification.priority;
      if (priority && typeof priority === 'string') {
        priority = priority.toUpperCase();
        if (!Object.values(NotificationPriority).includes(priority)) {
          priority = NotificationPriority.NORMAL;
        }
      } else {
        priority = NotificationPriority.NORMAL;
      }

      // Process status field (ensure uppercase)
      let status = notification.status;
      if (status && typeof status === 'string') {
        status = status.toUpperCase();
        if (!Object.values(NotificationStatus).includes(status)) {
          status = NotificationStatus.DRAFT;
        }
      } else {
        status = NotificationStatus.DRAFT;
      }

      return {
        ...notification,
        type,
        priority,
        status,
      };
    });

    // Return paginated response
    return {
      items: processedData,
      total: totalItems,
      page: currentPage,
      totalPages: totalPages,
    };
  },
};
