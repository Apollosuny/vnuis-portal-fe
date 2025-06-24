import { nexusAxios } from '@/configs/axios.config';

export interface ChatbotMessage {
  message: string;
  suggestedLinks: {
    name: string;
    route: string;
    description?: string;
  }[];
  quickActions?: {
    label: string;
    action: 'navigate' | 'copy' | 'external';
    route?: string;
    url?: string;
  }[];
  confidence: number;
  intent: string;
}

export interface ProcessMessageRequest {
  message: string;
}

export const chatbotApi = {
  /**
   * Process student message and get chatbot response
   */
  processMessage: async (message: string): Promise<ChatbotMessage> => {
    const response = await nexusAxios.post<ChatbotMessage>(
      '/chatbot/process-message',
      {
        message,
      }
    );
    return response.data;
  },

  /**
   * Sync intent routes from configuration
   */
  syncRoutes: async (): Promise<{ message: string }> => {
    const response = await nexusAxios.post<{ message: string }>(
      '/chatbot/sync-routes'
    );
    return response.data;
  },

  /**
   * Get all active intent routes
   */
  getRoutes: async (): Promise<any[]> => {
    const response = await nexusAxios.get<any[]>('/chatbot/routes');
    return response.data;
  },

  /**
   * Get routes by category
   */
  getRoutesByCategory: async (): Promise<Record<string, any[]>> => {
    const response = await nexusAxios.get<Record<string, any[]>>(
      '/chatbot/routes/by-category'
    );
    return response.data;
  },
};
