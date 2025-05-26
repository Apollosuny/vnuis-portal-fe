import { EventFormClient } from '@/clients/admin/events/event-form.client';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Create Event',
  description: 'Create a new event',
};

export default function CreateEventPage() {
  return (
    <DashboardLayout>
      <EventFormClient />
    </DashboardLayout>
  );
}
