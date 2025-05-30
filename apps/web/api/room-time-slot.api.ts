import {
  CreateTimeSlotDto,
  CreateTimeSlotResponseDto,
  TimeSlotRange,
} from '@/types/room-time-slot.types';
import { nexusAxios } from '../configs/axios.config';

const BASE_URL = '/room-time-slot';

// Global helper function to normalize time in all contexts
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

  // Make sure it's in HH:MM format with padded hours
  if (typeof timeString === 'string' && timeString.match(/^\d{1,2}:\d{2}$/)) {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      const hours = parts[0];
      const minutes = parts[1];
      if (hours && minutes) {
        return `${hours.padStart(2, '0')}:${minutes}`;
      }
    }
  }

  return timeString;
};

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
    console.log('Original time slot data:', data.timeRange);

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

    console.log('Normalized time slot data:', normalizedData.timeRange);

    const response = await nexusAxios.post(
      `${BASE_URL}/create`,
      normalizedData
    );

    console.log('Raw API response:', response.data);

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

    console.log('Normalized API response:', response.data);
    return response.data;
  },
};
