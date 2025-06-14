export interface Notification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  targetType: NotificationTargetType;
  targetIds?: string[]; // For specific students
  createdAt: string;
  scheduledAt?: string;
  sentAt?: string;
  revokedAt?: string;
  createdBy: string;
  readBy?: string[]; // Student IDs who have read this notification
  metadata?: Record<string, any>;
}

export enum NotificationType {
  GENERAL = 'GENERAL',
  ACADEMIC = 'ACADEMIC',
  EVENT = 'EVENT',
  SYSTEM = 'SYSTEM',
  URGENT = 'URGENT',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NotificationStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  REVOKED = 'REVOKED',
}

export enum NotificationTargetType {
  ALL_STUDENTS = 'ALL_STUDENTS',
  SPECIFIC_STUDENTS = 'SPECIFIC_STUDENTS',
  BY_CLASS = 'BY_CLASS',
  BY_MAJOR = 'BY_MAJOR',
}

export interface NotificationStats {
  total: number;
  draft: number;
  scheduled: number;
  sent: number;
  revoked: number;
  readRate: number;
}
