import { useQuery } from '@tanstack/react-query';
import { feedbackAnalyticsApi } from '@/api/feedback-analytics.api';
import { DateTime } from 'luxon';

export const useFeedbackDashboardOverview = (
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['feedback-dashboard-overview', startDate, endDate],
    queryFn: async () => {
      return await feedbackAnalyticsApi.getDashboardOverview(
        startDate,
        endDate
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFeedbackSentimentAnalysis = (
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['feedback-sentiment-analysis', startDate, endDate],
    queryFn: async () => {
      return await feedbackAnalyticsApi.getSentimentAnalysis(
        startDate,
        endDate
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFeedbackCategoryAnalysis = (
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['feedback-category-analysis', startDate, endDate],
    queryFn: async () => {
      return await feedbackAnalyticsApi.getCategoryAnalysis(startDate, endDate);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFeedbackRatingAnalysis = (
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['feedback-rating-analysis', startDate, endDate],
    queryFn: async () => {
      return await feedbackAnalyticsApi.getRatingAnalysis(startDate, endDate);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFeedbackResponseTimeAnalysis = (
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: ['feedback-response-time-analysis', startDate, endDate],
    queryFn: async () => {
      return await feedbackAnalyticsApi.getResponseTimeAnalysis(
        startDate,
        endDate
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFeedbackTrends = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['feedback-trends', startDate, endDate],
    queryFn: async () => {
      return await feedbackAnalyticsApi.getTrends(startDate, endDate);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper hook for date range management
export const useFeedbackDateRange = () => {
  const getDateRange = (
    range: '7d' | '30d' | '90d' | '1y' | 'custom',
    customStart?: string | null,
    customEnd?: string | null
  ) => {
    const now = DateTime.now();
    let start: DateTime;
    let end: DateTime = now;

    switch (range) {
      case '7d':
        start = now.minus({ days: 7 });
        break;
      case '30d':
        start = now.minus({ days: 30 });
        break;
      case '90d':
        start = now.minus({ days: 90 });
        break;
      case '1y':
        start = now.minus({ years: 1 });
        break;
      case 'custom':
        start = customStart
          ? DateTime.fromISO(customStart)
          : now.minus({ days: 30 });
        end = customEnd ? DateTime.fromISO(customEnd) : now;
        break;
      default:
        start = now.minus({ days: 30 });
    }

    return {
      startDate: start.toISO(),
      endDate: end.toISO(),
    };
  };

  return { getDateRange };
};
