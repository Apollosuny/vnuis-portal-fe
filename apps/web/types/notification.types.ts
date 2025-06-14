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
  GENERAL = 'general',
  ACADEMIC = 'academic',
  EVENT = 'event',
  SYSTEM = 'system',
  URGENT = 'urgent',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum NotificationStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENT = 'sent',
  REVOKED = 'revoked',
}

export enum NotificationTargetType {
  ALL_STUDENTS = 'all_students',
  SPECIFIC_STUDENTS = 'specific_students',
  BY_CLASS = 'by_class',
  BY_MAJOR = 'by_major',
}

export interface NotificationStats {
  total: number;
  draft: number;
  scheduled: number;
  sent: number;
  revoked: number;
  readRate: number;
}
