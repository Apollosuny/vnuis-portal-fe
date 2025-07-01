import { useQuery } from '@tanstack/react-query';
import {
  feedbackApi,
  Feedback,
  QueryFeedbackDto,
  PaginatedResponse,
} from '@/api/feedback.api';

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

  return useQuery<PaginatedResponse<Feedback>>({
    queryKey: [
      'admin-feedbacks',
      { page, limit, category, status, sentiment, startDate, endDate, search },
    ],
    queryFn: async () => {
      const query: any = {};

      if (search) {
        query.where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (category) {
        query.where.category = category;
      }

      if (status) {
        query.where.status = status;
      }

      if (sentiment) {
        query.where.sentiment = sentiment;
      }

      if (startDate && endDate) {
        query.where.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }

      query.include = ['student'];

      query.skip = (page - 1) * limit;
      query.take = limit;
      query.sort = { createdAt: 'desc' };

      return await feedbackApi.getFeedbacks(query);
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
        total: allFeedbacks.totalItems,
        byStatus: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        bySentiment: {} as Record<string, number>,
        averageRating: 0,
        totalRatings: 0,
      };

      let totalRating = 0;
      let ratingCount = 0;

      allFeedbacks.data.forEach((feedback) => {
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
