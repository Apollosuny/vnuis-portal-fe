import { Notification } from '@/types/notification.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type State = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
};

type Actions = {
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setUnreadCount: (count: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clean: () => void;
};

const defaultStates: State = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const useNotificationStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...defaultStates,
      setNotifications: (notifications) => set({ notifications }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        })),
      markAsRead: (notificationId) =>
        set((state) => {
          const userId = window.localStorage.getItem('user-storage')
            ? JSON.parse(window.localStorage.getItem('user-storage') || '{}')
                ?.state?.user?.id
            : null;

          if (!userId) {
            return state;
          }

          const updatedNotifications = state.notifications.map(
            (notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    readBy: [...(notification.readBy || []), userId],
                  }
                : notification
          );
          return {
            notifications: updatedNotifications,
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }),
      markAllAsRead: () =>
        set((state) => {
          const userId = window.localStorage.getItem('user-storage')
            ? JSON.parse(window.localStorage.getItem('user-storage') || '{}')
                ?.state?.user?.id
            : null;

          if (!userId) {
            return state;
          }

          return {
            notifications: state.notifications.map((notification) => ({
              ...notification,
              readBy: notification.readBy?.includes(userId)
                ? notification.readBy
                : [...(notification.readBy || []), userId],
            })),
            unreadCount: 0,
          };
        }),
      setUnreadCount: (count) => set({ unreadCount: count }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clean: () => set({ ...defaultStates }),
    }),
    {
      name: 'notification-storage',
    }
  )
);
