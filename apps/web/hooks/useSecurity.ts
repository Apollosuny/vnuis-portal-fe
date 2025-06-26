'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUserStore } from '../stores/user.store';
import {
  RateLimiter,
  validatePasswordStrength,
  sanitizeText,
  escapeHtml,
  generateCSRFToken,
  validateCSRFToken,
  secureStorage,
} from '@/utils/security';
import { toast } from 'sonner';

interface UseSecurityOptions {
  enableRateLimiting?: boolean;
  maxAttempts?: number;
  windowMs?: number;
}

export const useSecurity = (options: UseSecurityOptions = {}) => {
  const {
    enableRateLimiting = true,
    maxAttempts = 5,
    windowMs = 60000,
  } = options;
  const { user, isAuthenticated } = useUserStore();

  const [csrfToken, setCsrfToken] = useState<string>('');
  const [rateLimiter] = useState(() => new RateLimiter(maxAttempts, windowMs));

  // Generate CSRF token on mount
  useEffect(() => {
    const token = generateCSRFToken();
    setCsrfToken(token);
    secureStorage.setItem('csrf-token', token);
  }, []);

  // Validate user permissions
  const hasPermission = useCallback(
    (requiredRole: string | string[]) => {
      if (!isAuthenticated || !user) return false;

      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      return roles.includes(user.role);
    },
    [user, isAuthenticated]
  );

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasPermission(['ADMIN', 'SUPERADMIN']);
  }, [hasPermission]);

  // Rate limiting check
  const checkRateLimit = useCallback(
    (action: string) => {
      if (!enableRateLimiting) return true;

      const key = `${action}-${user?.id || 'anonymous'}`;
      const allowed = rateLimiter.isAllowed(key);

      if (!allowed) {
        toast.error('Too many attempts. Please try again later.');
      }

      return allowed;
    },
    [enableRateLimiting, rateLimiter, user?.id]
  );

  // Reset rate limit for an action
  const resetRateLimit = useCallback(
    (action: string) => {
      const key = `${action}-${user?.id || 'anonymous'}`;
      rateLimiter.reset(key);
    },
    [rateLimiter, user?.id]
  );

  // Sanitize input
  const sanitizeInput = useCallback((input: string) => {
    return sanitizeText(input);
  }, []);

  // Escape HTML content
  const escapeContent = useCallback((content: string) => {
    return escapeHtml(content);
  }, []);

  // Validate password strength
  const validatePassword = useCallback((password: string) => {
    return validatePasswordStrength(password);
  }, []);

  // Secure form submission
  const secureSubmit = useCallback(
    async (
      action: string,
      submitFn: () => Promise<any>,
      options?: {
        requireAuth?: boolean;
        requirePermission?: string | string[];
        showSuccess?: boolean;
        successMessage?: string;
      }
    ) => {
      const {
        requireAuth = true,
        requirePermission,
        showSuccess = true,
        successMessage = 'Operation completed successfully',
      } = options || {};

      try {
        // Check authentication
        if (requireAuth && !isAuthenticated) {
          toast.error('Please login to continue');
          return { success: false, error: 'Authentication required' };
        }

        // Check permissions
        if (requirePermission && !hasPermission(requirePermission)) {
          toast.error('You do not have permission to perform this action');
          return { success: false, error: 'Insufficient permissions' };
        }

        // Check rate limit
        if (!checkRateLimit(action)) {
          return { success: false, error: 'Rate limit exceeded' };
        }

        // Execute the submission
        const result = await submitFn();

        // Reset rate limit on success
        resetRateLimit(action);

        if (showSuccess) {
          toast.success(successMessage);
        }

        return { success: true, data: result };
      } catch (error) {
        console.error('Secure submit error:', error);
        toast.error('An error occurred. Please try again.');
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    [isAuthenticated, hasPermission, checkRateLimit, resetRateLimit]
  );

  // Secure data storage
  const secureStore = useCallback((key: string, value: string) => {
    secureStorage.setItem(key, value);
  }, []);

  const secureRetrieve = useCallback((key: string) => {
    return secureStorage.getItem(key);
  }, []);

  const secureRemove = useCallback((key: string) => {
    secureStorage.removeItem(key);
  }, []);

  // Validate CSRF token
  const validateCSRF = useCallback(
    (token: string) => {
      return validateCSRFToken(token, csrfToken);
    },
    [csrfToken]
  );

  // Get current CSRF token
  const getCSRFToken = useCallback(() => {
    return csrfToken;
  }, [csrfToken]);

  // Logout with security cleanup
  const secureLogout = useCallback(() => {
    // Clear all secure storage
    secureStorage.removeItem('jwt');
    secureStorage.removeItem('jwtRefresh');
    secureStorage.removeItem('csrf-token');

    // Reset rate limiters
    rateLimiter.reset('all');

    // Clear user store
    useUserStore.getState().clean();

    toast.success('Logged out successfully');
  }, [rateLimiter]);

  return {
    // User state
    user,
    isAuthenticated,

    // Permission checks
    hasPermission,
    isAdmin,

    // Rate limiting
    checkRateLimit,
    resetRateLimit,

    // Input sanitization
    sanitizeInput,
    escapeContent,

    // Password validation
    validatePassword,

    // Secure operations
    secureSubmit,
    secureStore,
    secureRetrieve,
    secureRemove,

    // CSRF protection
    validateCSRF,
    getCSRFToken,

    // Logout
    secureLogout,
  };
};
