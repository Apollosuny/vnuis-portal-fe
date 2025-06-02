import { nexusAxios } from '../configs/axios.config';

export interface CreateRoomBookingDto {
  startTime: Date;
  duration: number;
  purpose: string;
  isRecurring: boolean;
  roomId: string;
  offset: string;
}

export interface RoomBookingResponse {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  roomId: string;
  userId: string;
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

  // Cancel a room booking
  cancelBooking: async (bookingId: string): Promise<RoomBookingResponse> => {
    const response = await nexusAxios.delete(`${BASE_URL}/${bookingId}`);
    return response.data;
  },

  // Get user's bookings
  getUserBookings: async (): Promise<RoomBookingResponse[]> => {
    const response = await nexusAxios.get(`${BASE_URL}/user`);
    return response.data;
  },
};
