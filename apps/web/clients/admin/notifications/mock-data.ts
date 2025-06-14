import {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationTargetType,
  NotificationStats,
} from '@/types/notification.types';

// Mock data for notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'COVID-19 Class Suspension Notice',
    content:
      'The university announces temporary class suspension from June 15 to June 20, 2025 due to the pandemic situation. Students should follow updates on the official website.',
    type: NotificationType.URGENT,
    priority: NotificationPriority.CRITICAL,
    status: NotificationStatus.SENT,
    targetType: NotificationTargetType.ALL_STUDENTS,
    createdAt: '2025-06-10T08:00:00Z',
    sentAt: '2025-06-10T08:30:00Z',
    createdBy: 'admin@university.edu',
    readBy: ['student1', 'student2', 'student3'],
    metadata: {
      category: 'emergency',
      department: 'academic_affairs',
    },
  },
  {
    id: '2',
    title: 'New Semester Course Registration',
    content:
      'Students please note the course registration period for Semester 1, Academic Year 2025-2026 from June 25 to July 5, 2025. Please access the system to register.',
    type: NotificationType.ACADEMIC,
    priority: NotificationPriority.HIGH,
    status: NotificationStatus.SCHEDULED,
    targetType: NotificationTargetType.ALL_STUDENTS,
    createdAt: '2025-06-12T10:00:00Z',
    scheduledAt: '2025-06-20T08:00:00Z',
    createdBy: 'academic@university.edu',
    metadata: {
      semester: '2025-1',
      deadline: '2025-07-05T23:59:59Z',
    },
  },
  {
    id: '3',
    title: 'Career Fair 2025 Event',
    content:
      'The university is organizing Career Fair 2025 on June 30, 2025 at the Main Hall. Final year students are invited to participate.',
    type: NotificationType.EVENT,
    priority: NotificationPriority.NORMAL,
    status: NotificationStatus.SENT,
    targetType: NotificationTargetType.BY_CLASS,
    targetIds: ['class2021', 'class2022'],
    createdAt: '2025-06-11T14:00:00Z',
    sentAt: '2025-06-11T14:30:00Z',
    createdBy: 'events@university.edu',
    readBy: ['student4', 'student5'],
    metadata: {
      eventDate: '2025-06-30',
      location: 'Main Hall',
      registrationRequired: true,
    },
  },
  {
    id: '4',
    title: 'Online Learning System Update',
    content:
      'The LMS system will be under maintenance from 2:00 - 4:00 AM on June 16, 2025. Students please note that access will not be available during this time.',
    type: NotificationType.SYSTEM,
    priority: NotificationPriority.NORMAL,
    status: NotificationStatus.SENT,
    targetType: NotificationTargetType.ALL_STUDENTS,
    createdAt: '2025-06-13T16:00:00Z',
    sentAt: '2025-06-13T16:15:00Z',
    createdBy: 'it@university.edu',
    readBy: ['student1', 'student3', 'student6'],
    metadata: {
      maintenanceStart: '2025-06-16T02:00:00Z',
      maintenanceEnd: '2025-06-16T04:00:00Z',
      affectedServices: ['LMS', 'Email'],
    },
  },
  {
    id: '5',
    title: 'New Semester Tuition Fee Notice',
    content:
      'Tuition fee payment deadline for Semester 1, Academic Year 2025-2026 is from July 1 to July 31, 2025. Students can pay at the bank or via transfer.',
    type: NotificationType.GENERAL,
    priority: NotificationPriority.HIGH,
    status: NotificationStatus.DRAFT,
    targetType: NotificationTargetType.ALL_STUDENTS,
    createdAt: '2025-06-14T09:00:00Z',
    createdBy: 'finance@university.edu',
    metadata: {
      paymentPeriod: '2025-07-01_2025-07-31',
      amount: 15000000,
      paymentMethods: ['bank', 'transfer'],
    },
  },
  {
    id: '6',
    title: 'Revoked Notice - Old Exam Schedule',
    content:
      'The exam schedule has been updated, please check the latest exam schedule on the website.',
    type: NotificationType.ACADEMIC,
    priority: NotificationPriority.HIGH,
    status: NotificationStatus.REVOKED,
    targetType: NotificationTargetType.ALL_STUDENTS,
    createdAt: '2025-06-08T10:00:00Z',
    sentAt: '2025-06-08T10:30:00Z',
    revokedAt: '2025-06-09T08:00:00Z',
    createdBy: 'academic@university.edu',
    readBy: ['student1', 'student2'],
    metadata: {
      revokeReason: 'Schedule updated',
      replacedBy: 'notification_7',
    },
  },
];

// Mock notification stats
export const mockNotificationStats: NotificationStats = {
  total: 6,
  sent: 4,
  pending: 1,
  revoked: 1,
  readRate: 65.5,
};

// Mock students data for targeting
export const mockStudents = [
  {
    id: 'student1',
    name: 'John Smith',
    email: 'john.smith@student.edu',
    class: 'class2021',
  },
  {
    id: 'student2',
    name: 'Jane Doe',
    email: 'jane.doe@student.edu',
    class: 'class2021',
  },
  {
    id: 'student3',
    name: 'Michael Johnson',
    email: 'michael.johnson@student.edu',
    class: 'class2022',
  },
  {
    id: 'student4',
    name: 'Emily Davis',
    email: 'emily.davis@student.edu',
    class: 'class2022',
  },
  {
    id: 'student5',
    name: 'David Wilson',
    email: 'david.wilson@student.edu',
    class: 'class2023',
  },
  {
    id: 'student6',
    name: 'Sarah Brown',
    email: 'sarah.brown@student.edu',
    class: 'class2023',
  },
];

export const mockClasses = [
  { id: 'class2021', name: 'Class 2021', studentCount: 150 },
  { id: 'class2022', name: 'Class 2022', studentCount: 180 },
  { id: 'class2023', name: 'Class 2023', studentCount: 200 },
];

export const mockMajors = [
  { id: 'cs', name: 'Computer Science', studentCount: 300 },
  { id: 'business', name: 'Business Administration', studentCount: 250 },
  { id: 'engineering', name: 'Engineering', studentCount: 180 },
];
