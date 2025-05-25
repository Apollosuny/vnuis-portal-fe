// Event types based on Prisma schema
export interface Event {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  isPublished: boolean;
  imageUrl?: string;
  category?: string;
  registrationDeadline?: string;
  requireApproval: boolean;
  metadata?: Record<string, any>;
  createdByOperatorId: string;
  registrations?: EventRegistration[];
}

export enum EventRegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  ATTENDED = 'ATTENDED',
}

export interface EventRegistration {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: EventRegistrationStatus;
  handleAt?: string;
  remarks?: string;
  additionalInfo?: Record<string, any>;
  eventId: string;
  event?: Event;
  studentId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    studentId: string;
  };
  handleByOperatorId?: string;
  handleBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Event form types
export interface EventFormValues {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  capacity: number;
  isPublished: boolean;
  imageUrl?: string;
  category?: string;
  registrationDeadline?: Date;
  requireApproval: boolean;
  metadata?: Record<string, any>;
}

export interface EventRegistrationFormValues {
  additionalInfo?: Record<string, any>;
}

export interface EventFilterValues {
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  isPublished?: boolean;
}

export interface EventRegistrationStatusFormValues {
  status: EventRegistrationStatus;
  remarks?: string;
}
