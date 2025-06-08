import {
  CreateTimeSlotDto,
  CreateTimeSlotResponseDto,
  TimeSlotRange,
} from '@/types/room-time-slot.types';
import { nexusAxios } from '../configs/axios.config';

const BASE_URL = '/room-time-slot';

import { formatTimeFromISOString, convertTimeZone } from '../utils/date';

// Global helper function to normalize time in all contexts
const normalizeTime = (timeString: string | null | undefined): string => {
  if (!timeString) return '';

  // If it's an ISO date string, use Luxon for proper timezone handling
  if (typeof timeString === 'string' && timeString.includes('T')) {
    return formatTimeFromISOString(timeString, true); // Convert from UTC to local
  }

  // If it's just a time string (HH:MM), treat as UTC and convert to local time
  if (typeof timeString === 'string' && timeString.match(/^\d{1,2}:\d{2}$/)) {
    // Convert from UTC to local timezone
    return convertTimeZone(timeString, new Date(), false);
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
            // Handle both startHour/endHour and startTime/endTime fields
            startTime: slot.startHour || normalizeTime(slot.startTime) || '',
            endTime: slot.endHour || normalizeTime(slot.endTime) || '',
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
    // Convert local time to UTC before sending to backend
    const normalizedData = {
      ...data,
      timeRange: data.timeRange.map((slot) => ({
        ...slot,
        // Convert local time to UTC time format before sending
        startTime:
          typeof slot.startTime === 'string'
            ? convertTimeZone(slot.startTime, new Date(), true)
            : slot.startTime,
        endTime:
          typeof slot.endTime === 'string'
            ? convertTimeZone(slot.endTime, new Date(), true)
            : slot.endTime,
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
