// Room time slot types based on the backend models
export interface TimeSlotRange {
  startHour?: string; // For API response format
  endHour?: string; // For API response format
  startTime: string; // For normalized format
  endTime: string; // For normalized format
  dows: string[];
  formattedStartTime?: string;
  formattedEndTime?: string;
  localStartTime?: string; // For local timezone display
  localEndTime?: string; // For local timezone display
  id?: string;
  dowsBit?: number;
}

export interface CreateTimeSlotDto {
  timeRange: TimeSlotRange[];
  roomId: string;
}

export interface CreateTimeSlotResponseDto {
  success: boolean;
  timeSlots: TimeSlotRange[];
}

export interface AvailableTimeRange {
  startHour: string;
  endHour: string;
}

export interface TimeSlotFormValues {
  startTime: string;
  endTime: string;
  dows: string[];
}
