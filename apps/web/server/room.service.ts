import { Room } from '../types/room.types';

export class RoomService {
  static async getRoom(roomId: string): Promise<Room | null> {
    try {
      // Use fetch for server component API calls instead of axios
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/room/${roomId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch room');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching room data:', error);
      return null;
    }
  }
}
