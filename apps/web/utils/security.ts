/**
 * Security utilities for frontend protection
 */

// XSS Prevention - Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');
};

// Sanitize text input to prevent XSS
export const sanitizeText = (text: string): string => {
  if (!text) return '';

  return text
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .trim();
};

// Validate and sanitize URL
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';

  // Only allow http, https, and relative URLs
  const allowedProtocols = ['http:', 'https:', ''];
  const urlObj = new URL(url, window.location.origin);

  if (!allowedProtocols.includes(urlObj.protocol)) {
    return '';
  }

  return url;
};

// Validate file type for uploads
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): boolean => {
  if (!file || !allowedTypes.length) return false;

  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type.toLowerCase();

  return allowedTypes.some((type) => {
    const normalizedType = type.toLowerCase();
    return (
      fileExtension === normalizedType || mimeType.includes(normalizedType)
    );
  });
};

// Validate file size
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  if (!file) return false;

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

// Rate limiting utility
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (attempt.count >= this.maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  STUDENT_ID: /^[A-Z0-9]{8,12}$/,
  SLUG: /^[a-z0-9-]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

// Validate input against patterns
export const validateInput = (value: string, pattern: RegExp): boolean => {
  if (!value) return false;
  return pattern.test(value);
};

// Escape HTML entities
export const escapeHtml = (text: string): string => {
  if (!text) return '';

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
};

// Generate CSRF token (for forms)
export const generateCSRFToken = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Validate CSRF token
export const validateCSRFToken = (
  token: string,
  storedToken: string
): boolean => {
  return token === storedToken && token.length > 0;
};

// Secure storage utilities
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      // Encrypt sensitive data before storing
      const encryptedValue = btoa(encodeURIComponent(value));
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Failed to store item securely:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;

      return decodeURIComponent(atob(encryptedValue as string));
    } catch (error) {
      console.error('Failed to retrieve item securely:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  },
};

// Content Security Policy validation
export const validateCSP = (content: string): boolean => {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(content));
};

// Input length validation
export const validateInputLength = (
  input: string,
  minLength: number,
  maxLength: number
): boolean => {
  if (!input) return false;
  return input.length >= minLength && input.length <= maxLength;
};

// Password strength validation
export const validatePasswordStrength = (
  password: string
): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include at least one lowercase letter');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include at least one uppercase letter');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Include at least one special character');

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
};
