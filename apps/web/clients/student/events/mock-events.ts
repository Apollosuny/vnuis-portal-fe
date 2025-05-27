/**
 * MOCK DATA FOR STUDENT EVENTS PAGE
 *
 * This file provides mock data for demonstrating the student events functionality
 * without requiring a backend connection. The current date is assumed to be May 27, 2025.
 *
 * Features demonstrated:
 * - Upcoming and past events
 * - Events with different registration statuses
 * - Event with capacity limits (event-7 is almost full)
 * - Event registration and cancellation
 */

import { Event, EventRegistrationStatus } from '@/types/event.types';
import { DateTime } from 'luxon';

// Helper function to create ISO date strings
const createDate = (daysFromNow: number, hours = 0): string => {
  return DateTime.now().plus({ days: daysFromNow, hours: hours }).toISO() || '';
};

// Create mock events for testing
export const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'Orientation Day 2025',
    description:
      'Join us for the orientation day where you will meet faculty members, learn about campus facilities, and get to know your fellow students.',
    startTime: createDate(5, 9), // 5 days from now at 9 AM
    endTime: createDate(5, 17), // 5 days from now at 5 PM
    location: 'Main Campus Auditorium',
    capacity: 200,
    isPublished: true,
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94',
    category: 'Orientation',
    registrationDeadline: createDate(4), // 4 days from now
    requireApproval: false,
    createdAt: createDate(-10),
    updatedAt: createDate(-5),
    createdByOperatorId: 'op-1',
  },
  {
    id: 'event-2',
    name: 'Career Fair 2025',
    description:
      'Connect with potential employers from various industries. Bring your resume and be prepared for on-site interviews.',
    startTime: createDate(15, 10), // 15 days from now at 10 AM
    endTime: createDate(15, 16), // 15 days from now at 4 PM
    location: 'University Convention Center',
    capacity: 500,
    isPublished: true,
    imageUrl: 'https://images.unsplash.com/photo-1529400971008-f566de0e6dfc',
    category: 'Career',
    registrationDeadline: createDate(12), // 12 days from now
    requireApproval: true,
    createdAt: createDate(-15),
    updatedAt: createDate(-15),
    createdByOperatorId: 'op-2',
  },
  {
    id: 'event-3',
    name: 'Tech Innovation Workshop',
    description:
      'Learn about the latest technologies and how to apply innovative thinking to solve real-world problems.',
    startTime: createDate(7, 13), // 7 days from now at 1 PM
    endTime: createDate(7, 17), // 7 days from now at 5 PM
    location: 'Technology Building, Room 301',
    capacity: 50,
    isPublished: true,
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4',
    category: 'Workshop',
    registrationDeadline: createDate(5), // 5 days from now
    requireApproval: true,
    createdAt: createDate(-20),
    updatedAt: createDate(-18),
    createdByOperatorId: 'op-1',
  },
  {
    id: 'event-4',
    name: 'Alumni Networking Night',
    description:
      'Network with successful alumni from various fields and learn about their career journeys.',
    startTime: createDate(20, 18), // 20 days from now at 6 PM
    endTime: createDate(20, 21), // 20 days from now at 9 PM
    location: 'Grand Hotel Ballroom',
    capacity: 150,
    isPublished: true,
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865',
    category: 'Networking',
    registrationDeadline: createDate(18), // 18 days from now
    requireApproval: false,
    createdAt: createDate(-25),
    updatedAt: createDate(-23),
    createdByOperatorId: 'op-3',
  },
  {
    id: 'event-5',
    name: 'Summer Music Festival',
    description:
      'Annual summer music festival featuring performances from student bands and professional artists.',
    startTime: createDate(30, 16), // 30 days from now at 4 PM
    endTime: createDate(30, 22), // 30 days from now at 10 PM
    location: 'University Park',
    capacity: 1000,
    isPublished: true,
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
    category: 'Entertainment',
    registrationDeadline: createDate(25), // 25 days from now
    requireApproval: false,
    createdAt: createDate(-30),
    updatedAt: createDate(-30),
    createdByOperatorId: 'op-2',
  },
  {
    id: 'event-6',
    name: 'Research Symposium',
    description:
      'Showcase your research projects and get feedback from faculty and peers. Open to undergraduate and graduate students.',
    startTime: createDate(-5, 9), // 5 days ago (past event)
    endTime: createDate(-5, 17), // 5 days ago (past event)
    location: 'Science Building Conference Room',
    capacity: 100,
    isPublished: true,
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644',
    category: 'Academic',
    registrationDeadline: createDate(-10), // 10 days ago
    requireApproval: true,
    createdAt: createDate(-40),
    updatedAt: createDate(-35),
    createdByOperatorId: 'op-1',
  },
  {
    id: 'event-7',
    name: 'International Cultural Fair',
    description:
      'Experience cultures from around the world through food, music, art, and performances.',
    startTime: createDate(3, 10), // 3 days from now at 10 AM
    endTime: createDate(3, 16), // 3 days from now at 4 PM
    location: 'Student Center Plaza',
    capacity: 20, // Limited capacity for testing registration "Full" status
    isPublished: true,
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1',
    category: 'Cultural',
    registrationDeadline: createDate(2), // 2 days from now
    requireApproval: false,
    createdAt: createDate(-12),
    updatedAt: createDate(-10),
    createdByOperatorId: 'op-3',
  },
  {
    id: 'event-8',
    name: 'Graduate Student Symposium',
    description:
      'A professional development event specifically for graduate students to present their research and network with faculty.',
    startTime: createDate(10, 9), // 10 days from now at 9 AM
    endTime: createDate(10, 17), // 10 days from now at 5 PM
    location: 'Graduate Studies Building',
    capacity: 75,
    isPublished: true,
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
    category: 'Academic',
    registrationDeadline: createDate(8), // 8 days from now
    requireApproval: true,
    createdAt: createDate(-14),
    updatedAt: createDate(-12),
    createdByOperatorId: 'op-1',
  },
];

// Create some mock registrations for certain events
export const mockRegistrations = [
  {
    id: 'reg-rejected',
    eventId: 'event-8',
    status: EventRegistrationStatus.REJECTED,
    createdAt: createDate(-3),
    updatedAt: createDate(-2),
    studentId: 'current-user',
    handleAt: createDate(-2),
    remarks:
      'This event is limited to students in the Graduate Studies program.',
  },
  {
    id: 'reg-1',
    eventId: 'event-3',
    status: EventRegistrationStatus.PENDING,
    createdAt: createDate(-2),
    updatedAt: createDate(-2),
    studentId: 'current-user',
  },
  {
    id: 'reg-2',
    eventId: 'event-6',
    status: EventRegistrationStatus.ATTENDED, // Past event that was attended
    createdAt: createDate(-15),
    updatedAt: createDate(-6),
    studentId: 'current-user',
    handleAt: createDate(-6),
  },
  {
    id: 'reg-3',
    eventId: 'event-7',
    status: EventRegistrationStatus.APPROVED, // For testing "registered" status
    createdAt: createDate(-1),
    updatedAt: createDate(-1),
    studentId: 'other-user-1',
    handleAt: createDate(-1),
  },
  {
    id: 'reg-4',
    eventId: 'event-7',
    status: EventRegistrationStatus.APPROVED, // Filling capacity
    createdAt: createDate(-1),
    updatedAt: createDate(-1),
    studentId: 'other-user-2',
    handleAt: createDate(-1),
  },
  {
    id: 'reg-5',
    eventId: 'event-8',
    status: EventRegistrationStatus.REJECTED, // New rejected registration
    createdAt: createDate(-1),
    updatedAt: createDate(-1),
    studentId: 'other-user-3',
    handleAt: createDate(-1),
  },
  {
    id: 'reg-cancelled',
    eventId: 'event-5',
    status: EventRegistrationStatus.CANCELLED,
    createdAt: createDate(-7),
    updatedAt: createDate(-4),
    studentId: 'current-user',
    handleAt: createDate(-4),
  },
  // Add more registrations to fill up event-7's capacity
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `reg-filling-${i + 5}`,
    eventId: 'event-7',
    status: EventRegistrationStatus.APPROVED,
    createdAt: createDate(-1),
    updatedAt: createDate(-1),
    studentId: `other-user-${i + 3}`,
    handleAt: createDate(-1),
  })),
];
