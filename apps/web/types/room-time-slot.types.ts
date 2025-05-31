// Room time slot types based on the backend models
export interface TimeSlotRange {
  startTime: string;
  endTime: string;
  dows: string[];
  formattedStartTime?: string;
  formattedEndTime?: string;
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
