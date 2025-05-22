import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room } from '../types/room.types';

interface RoomState {
  rooms: Room[];
  selectedRoom: Room | null;
  isLoading: boolean;
  error: string | null;
}

interface RoomActions {
  setRooms: (rooms: Room[]) => void;
  setSelectedRoom: (room: Room | null) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updatedRoom: Room) => void;
  removeRoom: (roomId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRoomStore = create<RoomState & RoomActions>()(
  persist(
    (set) => ({
      // Initial state
      rooms: [],
      selectedRoom: null,
      isLoading: false,
      error: null,

      // Actions
      setRooms: (rooms) => set({ rooms }),
      setSelectedRoom: (room) => set({ selectedRoom: room }),
      addRoom: (room) =>
        set((state) => ({
          rooms: [...state.rooms, room],
        })),
      updateRoom: (roomId, updatedRoom) =>
        set((state) => ({
          rooms: state.rooms.map((room) =>
            room.roomId === roomId ? updatedRoom : room
          ),
          selectedRoom:
            state.selectedRoom?.roomId === roomId
              ? updatedRoom
              : state.selectedRoom,
        })),
      removeRoom: (roomId) =>
        set((state) => ({
          rooms: state.rooms.filter((room) => room.roomId !== roomId),
          selectedRoom:
            state.selectedRoom?.roomId === roomId ? null : state.selectedRoom,
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    { name: 'roomStore' }
  )
);
