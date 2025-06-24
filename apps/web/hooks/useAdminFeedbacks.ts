import { useQuery } from '@tanstack/react-query';
import { feedbackApi, Feedback, QueryFeedbackDto } from '@/api/feedback.api';

export interface UseAdminFeedbacksParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  sentiment?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const useAdminFeedbacks = (params: UseAdminFeedbacksParams = {}) => {
  const {
    page = 1,
    limit = 10,
    category,
    status,
    sentiment,
    startDate,
    endDate,
    search,
  } = params;

  const queryParams: QueryFeedbackDto = {
    skip: (page - 1) * limit,
    take: limit,
    include: ['student', 'reviewedByOperator', 'responses'],
    sort: { createdAt: 'desc' },
  };

  // Add filters
  if (category || status || sentiment || startDate || endDate || search) {
    queryParams.where = {};

    if (category) queryParams.where.category = category;
    if (status) queryParams.where.status = status;
    if (sentiment) queryParams.where.sentiment = sentiment;

    if (startDate || endDate) {
      queryParams.where.createdAt = {};
      if (startDate) queryParams.where.createdAt.gte = startDate;
      if (endDate) queryParams.where.createdAt.lte = endDate;
    }

    if (search) {
      queryParams.where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
  }

  return useQuery({
    queryKey: ['admin-feedbacks', queryParams],
    queryFn: async () => {
      return await feedbackApi.getFeedbacks(queryParams);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useFeedbackStats = () => {
  return useQuery({
    queryKey: ['feedback-stats'],
    queryFn: async () => {
      // Get basic stats from feedback list
      const allFeedbacks = await feedbackApi.getFeedbacks({
        take: 1000, // Get all for stats calculation
        include: ['student'],
      });

      const stats = {
        total: allFeedbacks.length,
        byStatus: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        bySentiment: {} as Record<string, number>,
        averageRating: 0,
        totalRatings: 0,
      };

      let totalRating = 0;
      let ratingCount = 0;

      allFeedbacks.forEach((feedback) => {
        // Status stats
        stats.byStatus[feedback.status] =
          (stats.byStatus[feedback.status] || 0) + 1;

        // Category stats
        stats.byCategory[feedback.category] =
          (stats.byCategory[feedback.category] || 0) + 1;

        // Sentiment stats
        if (feedback.sentiment) {
          stats.bySentiment[feedback.sentiment] =
            (stats.bySentiment[feedback.sentiment] || 0) + 1;
        }

        // Rating stats
        if (feedback.rating) {
          totalRating += feedback.rating;
          ratingCount++;
        }
      });

      stats.averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
      stats.totalRatings = ratingCount;

      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
