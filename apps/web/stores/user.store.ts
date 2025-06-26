// User store with zustand
import { IUser } from '@/types/user.type';
import { Operator, Student } from '@/types/user.types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type State = {
  user: IUser | null;
  student: Student | null;
  operator: Operator | null;
  jwt: string | null;
  jwtRefresh: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

type Actions = {
  setUser: (user: IUser | null) => void;
  setStudent: (student: Student | null) => void;
  setOperator: (operator: Operator | null) => void;
  setJwt: (jwt: string | null) => void;
  setJwtRefresh: (jwtRefresh: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  clean: () => void;
};

const defaultStates = {
  user: null,
  student: null,
  operator: null,
  jwt: null,
  jwtRefresh: null,
  isAuthenticated: false,
  isLoading: false,
};

// Secure storage for sensitive data
const secureStorage = {
  setItem: (key: string, value: string) => {
    try {
      // Simple base64 encoding for sensitive data
      const encoded = btoa(encodeURIComponent(value));
      localStorage.setItem(key, encoded);
    } catch (error) {
      console.error('Failed to store sensitive data:', error);
    }
  },
  getItem: (key: string) => {
    try {
      const encoded = localStorage.getItem(key);
      if (!encoded) return null;
      return decodeURIComponent(atob(encoded));
    } catch (error) {
      console.error('Failed to retrieve sensitive data:', error);
      return null;
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove sensitive data:', error);
    }
  },
};

export const useUserStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...defaultStates,
      setUser: (user) => set({ user }),
      setStudent: (student) => set({ student }),
      setOperator: (operator) => set({ operator }),
      setJwt: (jwt) => {
        if (jwt) {
          secureStorage.setItem('jwt', jwt);
        } else {
          secureStorage.removeItem('jwt');
        }
        set({ jwt });
      },
      setJwtRefresh: (jwtRefresh) => {
        if (jwtRefresh) {
          secureStorage.setItem('jwtRefresh', jwtRefresh);
        } else {
          secureStorage.removeItem('jwtRefresh');
        }
        set({ jwtRefresh });
      },
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setIsLoading: (isLoading) => set({ isLoading }),
      clean: () => {
        secureStorage.removeItem('jwt');
        secureStorage.removeItem('jwtRefresh');
        set({ ...defaultStates });
      },
    }),
    {
      name: 'user-storage',
      // Custom storage to handle sensitive data separately
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          if (!value) return null;

          try {
            const parsed = JSON.parse(value);
            // Restore JWT tokens from secure storage
            const jwt = secureStorage.getItem('jwt');
            const jwtRefresh = secureStorage.getItem('jwtRefresh');

            return {
              ...parsed,
              state: {
                ...parsed.state,
                jwt: jwt || null,
                jwtRefresh: jwtRefresh || null,
              },
            };
          } catch (error) {
            console.error('Failed to parse stored data:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const parsed = value as any;
            // Don't store JWT tokens in regular localStorage
            const { jwt, jwtRefresh, ...restState } = parsed.state;

            localStorage.setItem(
              name,
              JSON.stringify({
                ...parsed,
                state: restState,
              })
            );
          } catch (error) {
            console.error('Failed to store data:', error);
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
