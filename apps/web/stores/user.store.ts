// User store with zustand
import { IUser } from '@/types/user.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type State = {
  user: IUser | null;
  jwt: string | null;
  jwtRefresh: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type Actions = {
  setUser: (user: IUser | null) => void;
  setJwt: (jwt: string | null) => void;
  setJwtRefresh: (jwtRefresh: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  clean: () => void;
};

const defaultStates = {
  user: null,
  jwt: null,
  jwtRefresh: null,
  isAuthenticated: false,
  isLoading: false,
};

export const useUserStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...defaultStates,
      setUser: (user) => set({ user }),
      setJwt: (jwt) => set({ jwt }),
      setJwtRefresh: (jwtRefresh) => set({ jwtRefresh }),
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setIsLoading: (isLoading) => set({ isLoading }),
      clean: () => set({ ...defaultStates }),
    }),
    {
      name: 'user-storage',
    }
  )
);
