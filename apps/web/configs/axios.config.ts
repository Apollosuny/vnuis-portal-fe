import Axios, { InternalAxiosRequestConfig } from 'axios';
import { useUserStore } from '../stores/user.store';
import { refreshToken } from '@/api/auth.api';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

const axiosOptions = {
  baseURL: baseUrl,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const nexusAxios = Axios.create(axiosOptions);

nexusAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { jwt } = useUserStore.getState();

    if (jwt) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${jwt}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor để xử lý token hết hạn
nexusAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip token refresh logic for auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/local');

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return nexusAxios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const currentRefreshToken = useUserStore.getState().jwtRefresh;

        if (!currentRefreshToken) {
          throw new Error('No refresh token available');
        }
        const { jwt } = await refreshToken(currentRefreshToken);

        useUserStore.getState().setJwt(jwt);

        originalRequest.headers['Authorization'] = `Bearer ${jwt}`;

        processQueue(null, jwt);

        return nexusAxios(originalRequest);
      } catch (err) {
        useUserStore.getState().clean();
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
