import { nexusAxios } from '@/configs/axios.config';

export interface DashboardOverview {
  totalFeedbacks: number;
  totalResponses: number;
  avgRating: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  categoryDistribution: any[];
  recentTrends: any[];
}

export interface SentimentAnalysis {
  distribution: Array<{
    sentiment: string;
    _count: { id: number };
    _avg: { confidence: number };
  }>;
  trends: Array<{
    sentiment: string;
    createdAt: string;
    _count: { id: number };
  }>;
}

export interface CategoryAnalysis {
  distribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  trends: Array<{
    category: string;
    date: string;
    count: number;
  }>;
}

export interface RatingAnalysis {
  distribution: Array<{
    rating: number;
    _count: { id: number };
  }>;
  average: number;
}

export interface ResponseTimeAnalysis {
  averageResponseTime: number;
  responseTimeDistribution: {
    under1Hour: number;
    under24Hours: number;
    under72Hours: number;
    over72Hours: number;
  };
  totalResponded: number;
}

export const feedbackAnalyticsApi = {
  // Get dashboard overview
  getDashboardOverview: async (
    startDate?: string,
    endDate?: string
  ): Promise<DashboardOverview> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await nexusAxios.get(
      `/feedback-analytics/dashboard/overview?${params.toString()}`
    );
    return response.data;
  },

  // Get sentiment analysis
  getSentimentAnalysis: async (
    startDate?: string,
    endDate?: string
  ): Promise<SentimentAnalysis> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await nexusAxios.get(
      `/feedback-analytics/sentiment/analysis?${params.toString()}`
    );
    return response.data;
  },

  // Get category analysis
  getCategoryAnalysis: async (
    startDate?: string,
    endDate?: string
  ): Promise<CategoryAnalysis> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await nexusAxios.get(
      `/feedback-analytics/category/analysis?${params.toString()}`
    );
    return response.data;
  },

  // Get rating analysis
  getRatingAnalysis: async (
    startDate?: string,
    endDate?: string
  ): Promise<RatingAnalysis> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await nexusAxios.get(
      `/feedback-analytics/rating/analysis?${params.toString()}`
    );
    return response.data;
  },

  // Get response time analysis
  getResponseTimeAnalysis: async (
    startDate?: string,
    endDate?: string
  ): Promise<ResponseTimeAnalysis> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await nexusAxios.get(
      `/feedback-analytics/response-time/analysis?${params.toString()}`
    );
    return response.data;
  },

  // Get trends over time
  getTrends: async (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await nexusAxios.get(
      `/feedback-analytics/trends?${params.toString()}`
    );
    return response.data;
  },
};
