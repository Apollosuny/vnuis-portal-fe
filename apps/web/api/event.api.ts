import { nexusAxios } from '@/configs/axios.config';
import { EventRegistrationStatus } from '@/types/event.types';

export type CreateEventDto = {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  isPublished?: boolean;
  imageUrl?: string;
  category?: string;
  registrationDeadline?: string;
  requireApproval?: boolean;
  metadata?: Record<string, any>;
};

export type UpdateEventDto = Partial<CreateEventDto>;

export type RegisterEventDto = {
  eventId: string;
  additionalInfo?: Record<string, any>;
};

export type UpdateRegistrationStatusDto = {
  status: EventRegistrationStatus;
  remarks?: string;
};

export type QueryEventDto = {
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  isPublished?: boolean;
  page?: number;
  limit?: number;
};

export type QueryEventRegistrationDto = {
  eventId?: string;
  status?: EventRegistrationStatus;
  studentId?: string;
  page?: number;
  limit?: number;
};

export const eventApi = {
  getEvents: async (params?: QueryEventDto) => {
    const response = await nexusAxios.get('/events', { params });
    return response.data;
  },

  getEventsByStudent: async (params?: { include?: string[] }) => {
    const queryParams: Record<string, any> = {};

    if (params?.include) {
      queryParams.include = [params.include.join(',')];
    }

    const response = await nexusAxios.get('/events/student', {
      params: queryParams,
    });
    return response.data;
  },

  getEvent: async (id: string) => {
    const response = await nexusAxios.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: CreateEventDto) => {
    const response = await nexusAxios.post('/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: UpdateEventDto) => {
    const response = await nexusAxios.put(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string) => {
    const response = await nexusAxios.delete(`/events/${id}`);
    return response.data;
  },

  publishEvent: async (id: string) => {
    const response = await nexusAxios.put(`/events/${id}/publish`);
    return response.data;
  },

  unpublishEvent: async (id: string) => {
    const response = await nexusAxios.put(`/events/${id}/unpublish`);
    return response.data;
  },

  getEventRegistrations: async (params?: QueryEventRegistrationDto) => {
    const response = await nexusAxios.get('/events/registrations', { params });
    return response.data;
  },

  getEventRegistration: async (id: string) => {
    const response = await nexusAxios.get(`/events/registrations/${id}`);
    return response.data;
  },

  registerEvent: async (data: RegisterEventDto) => {
    const response = await nexusAxios.post('/events/register', data);
    return response.data;
  },

  cancelRegistration: async (id: string) => {
    const response = await nexusAxios.put(`/events/registrations/${id}/cancel`);
    return response.data;
  },

  updateRegistrationStatus: async (
    id: string,
    data: UpdateRegistrationStatusDto
  ) => {
    const response = await nexusAxios.put(
      `/events/registrations/${id}/status`,
      data
    );
    return response.data;
  },
};
