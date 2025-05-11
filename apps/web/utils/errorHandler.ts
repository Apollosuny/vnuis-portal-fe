import { AxiosError } from 'axios';
import { toast } from 'sonner';

type ErrorResponse = {
  message?: string;
  error?: string;
  statusCode?: number;
};

type ToastConfig = {
  title?: string;
  description: string;
};

/**
 * Gets a human-readable error message from different error types
 * @param error The error caught from try/catch
 * @param fallbackMessage Default message to show if no details are available
 * @returns Error message string
 */
const getErrorMessage = (
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse | undefined;
    return data?.message || data?.error || error.message || fallbackMessage;
  }
  return error instanceof Error ? error.message : fallbackMessage;
};

/**
 * Shows an error toast with the specified title and description
 * @param title Toast title
 * @param description Toast description message
 * @returns The displayed message
 */
const showErrorToast = (title: string, description: string): string => {
  toast.error(description, {
    description: title,
  });
  return description;
};

/**
 * Handles API and RPC errors and displays appropriate toast messages
 * @param error The error caught from try/catch
 * @param fallbackMessage Default message to show if no details are available
 * @returns The error message that was displayed
 */
export const handleApiError = (
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): string => {
  // Handle network connectivity errors
  if (error instanceof AxiosError && !error.response) {
    return showErrorToast(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection.'
    );
  }

  // Handle Axios HTTP errors
  if (error instanceof AxiosError && error.response) {
    const httpMessage = getErrorMessage(error, fallbackMessage);
    const status = error.response.status;

    // Map common HTTP status codes to friendlier descriptions
    switch (status) {
      case 400:
        return showErrorToast(
          'Bad Request',
          httpMessage || 'Invalid data submitted'
        );

      case 401:
        return showErrorToast(
          'Authentication Error',
          httpMessage || 'You need to log in to access this resource'
        );

      case 403:
        return showErrorToast(
          'Access Denied',
          httpMessage || 'You do not have permission to perform this action'
        );

      case 404:
        return showErrorToast(
          'Not Found',
          httpMessage || 'The requested resource could not be found'
        );

      case 409:
        return showErrorToast(
          'Conflict',
          httpMessage || 'This operation conflicts with another change'
        );

      case 429:
        return showErrorToast(
          'Too Many Requests',
          httpMessage || 'Please slow down and try again later'
        );

      case 500:
      case 502:
      case 503:
      case 504:
        return showErrorToast(
          'Server Error',
          httpMessage || 'Something went wrong on our servers'
        );

      default:
        return showErrorToast(`Error ${status || ''}`, httpMessage);
    }
  }

  // Fallback for all other errors
  const genericMessage = getErrorMessage(error, fallbackMessage);
  return showErrorToast('Error', genericMessage);
};
