/**
 * Extract a readable error message from an API error
 */
export const getAPIErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';

  // Handle axios error structure
  if (error.response) {
    const { data, status } = error.response;

    // Handle structured error responses
    if (data.message) {
      return Array.isArray(data.message)
        ? data.message.join('. ')
        : data.message;
    }

    // Handle status-based generic messages
    if (status === 401) return 'Authentication required. Please log in again.';
    if (status === 403)
      return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status >= 500)
      return 'A server error occurred. Please try again later.';

    return data.error || 'An error occurred';
  }

  // Handle network errors
  if (error.request) {
    return 'Network error. Please check your internet connection.';
  }

  // Handle other errors
  return error.message || 'An unknown error occurred';
};
