import { nexusAxios } from '../configs/axios.config';
import type {
  CreateRoomDto,
  QueryRoomDto,
  Room,
  UpdateRoomDto,
} from '../types/room.types';

const BASE_URL = '/room';

export const roomApi = {
  // Get all rooms with optional filtering
  getRooms: async (query?: QueryRoomDto): Promise<Room[]> => {
    const response = await nexusAxios.get(BASE_URL, { params: query });
    return response.data;
  },

  // Get a single room by ID
  getRoom: async (roomId: string): Promise<Room> => {
    const response = await nexusAxios.get(`${BASE_URL}/${roomId}`);
    return response.data;
  },

  // Create a new room
  createRoom: async (data: CreateRoomDto): Promise<Room> => {
    const response = await nexusAxios.post(BASE_URL, data);
    return response.data;
  },

  // Update an existing room
  updateRoom: async (roomId: string, data: UpdateRoomDto): Promise<Room> => {
    const response = await nexusAxios.put(`${BASE_URL}/${roomId}`, data);
    return response.data;
  },

  // Delete a room
  deleteRoom: async (roomId: string): Promise<Room> => {
    const response = await nexusAxios.delete(`${BASE_URL}/${roomId}`);
    return response.data;
  },
};
