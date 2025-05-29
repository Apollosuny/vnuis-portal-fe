// Room types based on the backend models
export enum RoomType {
  CLASSROOM = 'CLASSROOM',
  LAB = 'LAB',
  EVENT = 'EVENT',
}

export enum RoomBookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface Room {
  roomId: string;
  name: string;
  description: string | null;
  capacity: number;
  location: string;
  type: RoomType;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  timeSlots?: RoomTimeSlot[];
  bookings?: RoomBooking[];
}

export interface RoomTimeSlot {
  id: string;
  createdAt: string;
  updatedAt: string;
  startTime: string;
  endTime: string;
  dowsBit: number;
  roomId: string;
  dows?: string[]; // Added for form compatibility
}

export interface RoomBooking {
  id: string;
  createdAt: string;
  updatedAt: string;
  startTime: string;
  endTime: string;
  duration: number;
  purpose: string;
  handleAt?: string;
  remarks?: string;
  attendees?: number;
  isRecurring: boolean;
  status: RoomBookingStatus;
  roomId: string;
}

// DTOs for API requests
export interface CreateRoomDto {
  name: string;
  description?: string;
  capacity: number;
  location: string;
  type: RoomType;
  isAvailable?: boolean;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {}

export interface QueryRoomDto {
  where?: Record<string, any>;
  sort?: Record<string, string>;
  select?: string[];
  include?: string[];
  skip?: number;
  take?: number;
}
