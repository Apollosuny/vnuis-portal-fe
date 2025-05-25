import { StudentEventsClient } from '@/clients/student/events/student-events.client';

export const metadata = {
  title: 'Events',
  description: 'Browse and register for upcoming events',
};

export default function StudentEventsPage() {
  return <StudentEventsClient />;
}
