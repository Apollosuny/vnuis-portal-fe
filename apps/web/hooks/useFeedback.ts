import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  feedbackApi,
  Feedback,
  CreateFeedbackDto,
  UpdateFeedbackDto,
  QueryFeedbackDto,
} from '@/api/feedback.api';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/user.store';

export const useMyFeedbacks = (query?: QueryFeedbackDto) => {
  const { user } = useUserStore();

  return useQuery({
    queryKey: ['myFeedbacks', user?.id, query],
    queryFn: async () => {
      if (!user?.id) return [];

      // Query for current student's feedbacks
      const studentQuery: QueryFeedbackDto = {
        where: { studentId: user.id },
        sort: { createdAt: 'desc' },
        include: ['responses'],
        ...query,
      };

      return await feedbackApi.getMyFeedbacks(studentQuery);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFeedback = (id: string) => {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: async () => {
      return await feedbackApi.getFeedback(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  return useMutation({
    mutationFn: async (data: CreateFeedbackDto) => {
      return await feedbackApi.createFeedback(data);
    },
    onSuccess: (feedback) => {
      toast.success('Feedback submitted successfully!');
      // Invalidate and refetch my feedbacks
      queryClient.invalidateQueries({ queryKey: ['myFeedbacks', user?.id] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to submit feedback';
      toast.error(message);
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFeedbackDto;
    }) => {
      return await feedbackApi.updateFeedback(id, data);
    },
    onSuccess: (feedback) => {
      toast.success('Feedback updated successfully!');
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['feedback', feedback.id] });
      queryClient.invalidateQueries({ queryKey: ['myFeedbacks', user?.id] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to update feedback';
      toast.error(message);
    },
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  const { user } = useUserStore();

  return useMutation({
    mutationFn: async (id: string) => {
      return await feedbackApi.deleteFeedback(id);
    },
    onSuccess: () => {
      toast.success('Feedback deleted successfully!');
      // Invalidate and refetch my feedbacks
      queryClient.invalidateQueries({ queryKey: ['myFeedbacks', user?.id] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to delete feedback';
      toast.error(message);
    },
  });
};

export const useSearchFeedbacks = (params: {
  q?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  sentiment?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['searchFeedbacks', params],
    queryFn: async () => {
      return await feedbackApi.searchFeedbacks(params);
    },
    enabled:
      !!params.q || !!params.category || !!params.status || !!params.startDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
