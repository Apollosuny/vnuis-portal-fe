import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
  setRightSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Default to false (expanded sidebar), but will be auto-collapsed on mobile
      isSidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ isSidebarCollapsed: collapsed }),
      // Default to false (right sidebar is closed)
      isRightSidebarOpen: false,
      toggleRightSidebar: () =>
        set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
      setRightSidebarOpen: (open) => set({ isRightSidebarOpen: open }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
