import { useState, useCallback } from 'react';
import { chatbotApi, ChatbotMessage } from '@/api/chatbot.api';

export const useChatbot = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processMessage = useCallback(
    async (message: string): Promise<ChatbotMessage | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await chatbotApi.processMessage(message);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Có lỗi xảy ra khi xử lý tin nhắn';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const syncRoutes = useCallback(async (): Promise<boolean> => {
    try {
      await chatbotApi.syncRoutes();
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi đồng bộ routes';
      setError(errorMessage);
      return false;
    }
  }, []);

  const getRoutes = useCallback(async () => {
    try {
      return await chatbotApi.getRoutes();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi lấy routes';
      setError(errorMessage);
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    processMessage,
    syncRoutes,
    getRoutes,
    clearError,
  };
};
