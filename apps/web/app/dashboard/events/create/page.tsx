import { EventFormClient } from '@/clients/admin/events/event-form.client';

export const metadata = {
  title: 'Create Event',
  description: 'Create a new event',
};

export default function CreateEventPage() {
  return <EventFormClient />;
}
