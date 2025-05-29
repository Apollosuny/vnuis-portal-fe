import {
  CreateTimeSlotDto,
  CreateTimeSlotResponseDto,
  TimeSlotRange,
} from '@/types/room-time-slot.types';
import { nexusAxios } from '../configs/axios.config';

const BASE_URL = '/room-time-slot';

export const roomTimeSlotApi = {
  // Get available time slots for a room by date
  getAvailableTimeSlots: async (
    roomId: string,
    date: string,
    offset?: string
  ): Promise<TimeSlotRange[]> => {
    const params = new URLSearchParams();
    params.append('date', date);
    if (offset) params.append('offset', offset);

    try {
      const response = await nexusAxios.get(
        `${BASE_URL}/${roomId}?${params.toString()}`
      );

      // Helper function to normalize time in all contexts
      const normalizeTime = (timeString: string | null | undefined): string => {
        if (!timeString) return '';

        // If it's an ISO date string, extract just the time part
        if (typeof timeString === 'string' && timeString.includes('T')) {
          const timeParts = timeString.split('T');
          if (timeParts.length > 1 && timeParts[1]) {
            // Take just the HH:MM part
            return timeParts[1].substring(0, 5);
          }
        }
        return timeString;
      };

      // Make sure we process the data correctly
      if (response.data && Array.isArray(response.data)) {
        // Normalize time formats in case they're coming as ISO strings
        return response.data.map(
          (slot: any): TimeSlotRange => ({
            ...slot,
            // Always normalize time strings
            startTime: normalizeTime(slot.startTime),
            endTime: normalizeTime(slot.endTime),
            // Ensure dows is always an array
            dows: Array.isArray(slot.dows) ? slot.dows : [],
          })
        );
      }
      return response.data || [];
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      return [];
    }
  },

  // Create time slots for a room
  createTimeSlots: async (
    data: CreateTimeSlotDto
  ): Promise<CreateTimeSlotResponseDto> => {
    // Helper function to normalize time in all contexts
    const normalizeTime = (timeString: string | null | undefined): string => {
      if (!timeString) return '';

      // If it's an ISO date string, extract just the time part
      if (typeof timeString === 'string' && timeString.includes('T')) {
        const timeParts = timeString.split('T');
        if (timeParts.length > 1 && timeParts[1]) {
          // Take just the HH:MM part
          return timeParts[1].substring(0, 5);
        }
      }
      return timeString;
    };

    // Make sure we're sending proper time formats to the backend
    const normalizedData = {
      ...data,
      timeRange: data.timeRange.map((slot) => ({
        ...slot,
        startTime: normalizeTime(slot.startTime),
        endTime: normalizeTime(slot.endTime),
        dows: Array.isArray(slot.dows) ? slot.dows : [],
      })),
    };

    const response = await nexusAxios.post(
      `${BASE_URL}/create`,
      normalizedData
    );

    // Normalize the response data to ensure time slots are formatted correctly
    if (
      response.data &&
      response.data.timeSlots &&
      Array.isArray(response.data.timeSlots)
    ) {
      response.data.timeSlots = response.data.timeSlots.map(
        (slot: TimeSlotRange) => ({
          ...slot,
          // Always normalize time strings
          startTime: normalizeTime(slot.startTime),
          endTime: normalizeTime(slot.endTime),
          // Ensure dows is always an array
          dows: Array.isArray(slot.dows) ? slot.dows : [],
        })
      );
    }

    return response.data;
  },
};
