import { StudentEventsClient } from '@/clients/student/events';

export const metadata = {
  title: 'Events',
  description: 'Browse and register for upcoming events',
};

export default function StudentEventsPage() {
  return <StudentEventsClient />;
}
