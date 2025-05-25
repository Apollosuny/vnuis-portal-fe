import { EventsClient } from '@/clients/admin/events/events-list.client';

export const metadata = {
  title: 'Events Management',
  description: 'Manage all events in the system',
};

export default function EventsPage() {
  return <EventsClient />;
}
