import { Student } from '@/types/user.types';
import { nexusAxios } from '../configs/axios.config';

export interface CreateRoomBookingDto {
  startTime: string;
  duration: number;
  purpose: string;
  isRecurring: boolean;
  roomId: string;
  offset: string;
}

export interface UpdateRoomBookingDto {
  startTime?: string;
  duration?: number;
  purpose?: string;
  isRecurring?: boolean;
  attendees?: number;
  offset: string;
}

export interface RoomBookingResponse {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  purpose: string;
  status: string;
  handleAt?: string;
  remarks?: string;
  attendees?: number;
  isRecurring: boolean;
  roomId: string;
  createdAt: string;
  updatedAt: string;
  room?: {
    name: string;
    location: string;
  };
  student?: Student;
}

export interface RoomBookingResponseWithPagination {
  data: RoomBookingResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RoomBookingHandleDto {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

const BASE_URL = '/room-booking';

export const roomBookingApi = {
  // Create a room booking
  createBooking: async (
    bookingData: CreateRoomBookingDto
  ): Promise<RoomBookingResponse> => {
    const response = await nexusAxios.post(`${BASE_URL}/create`, bookingData);
    return response.data;
  },

  // Get current user's bookings with pagination
  getMyBookings: async (
    page = 1,
    limit = 10
  ): Promise<RoomBookingResponseWithPagination> => {
    const response = await nexusAxios.get(`${BASE_URL}/my-bookings`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get all room bookings (admin/operator only)
  getRoomBookings: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
  }): Promise<RoomBookingResponseWithPagination> => {
    const response = await nexusAxios.get(BASE_URL, { params });
    return response.data;
  },

  // Get a single booking by ID
  getBooking: async (bookingId: string): Promise<RoomBookingResponse> => {
    const response = await nexusAxios.get(`${BASE_URL}/${bookingId}`);
    return response.data;
  },

  // Update a booking
  updateBooking: async (
    bookingId: string,
    data: UpdateRoomBookingDto
  ): Promise<RoomBookingResponse> => {
    const response = await nexusAxios.put(`${BASE_URL}/${bookingId}`, data);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string): Promise<RoomBookingResponse> => {
    const response = await nexusAxios.delete(`${BASE_URL}/${bookingId}`);
    return response.data;
  },

  // Approve/reject a booking (admin/operator only)
  handleBooking: async (
    bookingId: string,
    data: RoomBookingHandleDto
  ): Promise<RoomBookingResponse> => {
    const response = await nexusAxios.patch(
      `${BASE_URL}/${bookingId}/handle`,
      data
    );
    return response.data;
  },
};
