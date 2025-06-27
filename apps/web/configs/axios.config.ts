import Axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { useUserStore } from '../stores/user.store';
import { refreshToken } from '@/api/auth.api';
import { RateLimiter, sanitizeText } from '@/utils/security';
import qs from 'qs';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

const axiosOptions = {
  baseURL: baseUrl,
  timeout: 300000,
  withCredentials: true, // Enable sending cookies and credentials
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  },
  // Prevent axios from following redirects automatically
  maxRedirects: 0,
  // Validate status to prevent redirect attacks
  validateStatus: (status: number) => status >= 200 && status < 300,
};

export const nexusAxios = Axios.create(axiosOptions);

// Rate limiter for API calls
const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

// Request interceptor with security enhancements
nexusAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { jwt } = useUserStore.getState();

    // Add authentication header
    if (jwt) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${jwt}`;
    }

    // Rate limiting check
    const clientId = 'api-client'; // In production, use user ID or IP
    if (!apiRateLimiter.isAllowed(clientId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Sanitize request data if present
    if (config.data && typeof config.data === 'object') {
      config.data = sanitizeRequestData(config.data);
    }

    // Sanitize URL parameters
    if (config.params && typeof config.params === 'object') {
      config.params = sanitizeRequestData(config.params);
    }

    // Add request timestamp for security
    config.headers['X-Request-Timestamp'] = Date.now().toString();

    // Add CSRF token if available
    const csrfToken = localStorage.getItem('csrf-token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
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

// Response interceptor with enhanced security
nexusAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    // Validate response headers for security
    validateResponseHeaders(response);

    // Sanitize response data
    if (response.data) {
      response.data = sanitizeResponseData(response.data);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle rate limiting errors
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded');
      // Reset rate limiter for this client
      apiRateLimiter.reset('api-client');
      throw new Error('Too many requests. Please try again later.');
    }

    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes('/auth/local');

      if (!isAuthEndpoint) {
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
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          useUserStore.getState().clean();
          processQueue(refreshError, null);

          // Redirect to login if in browser
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Handle other errors
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
      throw new Error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// Security utility functions
function sanitizeRequestData(data: any): any {
  if (typeof data === 'string') {
    return sanitizeText(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeRequestData(item));
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields from sanitization
      if (['password', 'token', 'jwt', 'refreshToken'].includes(key)) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeRequestData(value);
      }
    }
    return sanitized;
  }

  return data;
}

function sanitizeResponseData(data: any): any {
  if (typeof data === 'string') {
    return sanitizeText(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeResponseData(item));
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeResponseData(value);
    }
    return sanitized;
  }

  return data;
}

function validateResponseHeaders(response: AxiosResponse): void {
  // Check for security headers
  const securityHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security',
  ];

  const missingHeaders = securityHeaders.filter(
    (header) => !response.headers[header.toLowerCase()]
  );

  if (missingHeaders.length > 0) {
    console.warn('Missing security headers:', missingHeaders);
  }

  // Validate content type
  const contentType = response.headers['content-type'];
  if (contentType && !contentType.includes('application/json')) {
    console.warn('Unexpected content type:', contentType);
  }
}

// Export rate limiter for use in components
export { apiRateLimiter };

// Export security utilities
export const securityUtils = {
  sanitizeRequestData,
  sanitizeResponseData,
  validateResponseHeaders,
};
