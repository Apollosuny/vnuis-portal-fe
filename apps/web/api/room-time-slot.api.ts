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

  console.log('Normalizing time:', timeString);

  // If it's an ISO date string, use Luxon for proper timezone handling
  if (typeof timeString === 'string' && timeString.includes('T')) {
    const result = formatTimeFromISOString(timeString, true); // Convert from UTC to local
    console.log(`Normalized ISO time ${timeString} -> ${result}`);
    return result;
  }

  // If it's just a time string (HH:MM), treat as UTC and convert to local time
  if (typeof timeString === 'string' && timeString.match(/^\d{1,2}:\d{2}$/)) {
    const result = convertTimeZone(timeString, new Date(), false);
    console.log(
      `Normalized time string ${timeString} -> ${result} (UTC to local)`
    );
    return result;
  }

  console.log('Time string not recognized for normalization:', timeString);
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
        console.log('Raw API timeslots response:', response.data);

        // Normalize time formats in case they're coming as ISO strings
        const mappedSlots = response.data.map((slot: any): TimeSlotRange => {
          // We need to preserve original values from the API but also provide local time versions
          const processedSlot = {
            ...slot,
            // Keep original API values
            startHour: slot.startHour || '',
            endHour: slot.endHour || '',
            // Normalize time formats using our utility
            startTime: slot.startHour || normalizeTime(slot.startTime) || '',
            endTime: slot.endHour || normalizeTime(slot.endTime) || '',
            // Ensure dows is always an array
            dows: Array.isArray(slot.dows) ? slot.dows : [],
          };

          console.log('Processing slot:', {
            original: {
              startHour: slot.startHour,
              endHour: slot.endHour,
              startTime: slot.startTime,
              endTime: slot.endTime,
            },
            processed: {
              startHour: processedSlot.startHour,
              endHour: processedSlot.endHour,
              startTime: processedSlot.startTime,
              endTime: processedSlot.endTime,
            },
          });

          return processedSlot;
        });

        console.log('Normalized timeslots:', mappedSlots);
        return mappedSlots;
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
