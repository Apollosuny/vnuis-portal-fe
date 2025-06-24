import { nexusAxios } from '@/configs/axios.config';

export interface Feedback {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  category: FeedbackCategory;
  rating?: number;
  sentiment?: SentimentType;
  confidence?: number;
  keywords: string[];
  aiAnalysis?: any;
  status: FeedbackStatus;
  reviewedAt?: string;
  reviewedBy?: string;
  metadata?: any;
  studentId: string;
  reviewedByOperatorId?: string;
  student?: any;
  reviewedByOperator?: any;
  responses?: FeedbackResponse[];
}

export interface FeedbackResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  isInternal: boolean;
  feedbackId: string;
  operatorId: string;
  operator?: any;
}

export enum FeedbackCategory {
  GENERAL = 'GENERAL',
  USER_EXPERIENCE = 'USER_EXPERIENCE',
  FUNCTIONALITY = 'FUNCTIONALITY',
  PERFORMANCE = 'PERFORMANCE',
  DESIGN = 'DESIGN',
  CONTENT = 'CONTENT',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  SUGGESTION = 'SUGGESTION',
  COMPLAINT = 'COMPLAINT',
  COMPLIMENT = 'COMPLIMENT',
}

export enum SentimentType {
  POSITIVE = 'POSITIVE',
  NEGATIVE = 'NEGATIVE',
  NEUTRAL = 'NEUTRAL',
  MIXED = 'MIXED',
}

export enum FeedbackStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
}

export interface CreateFeedbackDto {
  title: string;
  content: string;
  category: FeedbackCategory;
  rating?: number;
}

export interface UpdateFeedbackDto {
  title?: string;
  content?: string;
  category?: FeedbackCategory;
  rating?: number;
}

export interface QueryFeedbackDto {
  where?: Record<string, any>;
  sort?: Record<string, string>;
  select?: string[];
  include?: string[];
  skip?: number;
  take?: number;
}

export const feedbackApi = {
  // Get all feedbacks with optional query parameters
  getFeedbacks: async (query?: QueryFeedbackDto): Promise<Feedback[]> => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await nexusAxios.get(`/feedback?${params.toString()}`);
    return response.data;
  },

  // Get feedback by ID
  getFeedback: async (id: string): Promise<Feedback> => {
    const response = await nexusAxios.get(`/feedback/${id}`);
    return response.data;
  },

  // Create new feedback
  createFeedback: async (data: CreateFeedbackDto): Promise<Feedback> => {
    const response = await nexusAxios.post('/feedback', data);
    return response.data;
  },

  // Update feedback
  updateFeedback: async (
    id: string,
    data: UpdateFeedbackDto
  ): Promise<Feedback> => {
    const response = await nexusAxios.put(`/feedback/${id}`, data);
    return response.data;
  },

  // Delete feedback
  deleteFeedback: async (id: string): Promise<{ message: string }> => {
    const response = await nexusAxios.delete(`/feedback/${id}`);
    return response.data;
  },

  // Get my feedbacks (for current student)
  getMyFeedbacks: async (query?: QueryFeedbackDto): Promise<Feedback[]> => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await nexusAxios.get(`/feedback?${params.toString()}`);
    return response.data;
  },

  // Search feedbacks
  searchFeedbacks: async (params: {
    q?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    sentiment?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Feedback[]> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const response = await nexusAxios.get(
      `/feedback/search?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get feedback responses
  getFeedbackResponses: async (
    feedbackId: string,
    includeInternal?: boolean
  ): Promise<FeedbackResponse[]> => {
    const params = new URLSearchParams();
    if (includeInternal !== undefined) {
      params.append('includeInternal', String(includeInternal));
    }

    const response = await nexusAxios.get(
      `/feedback-response/feedback/${feedbackId}/responses?${params.toString()}`
    );
    return response.data;
  },
};
