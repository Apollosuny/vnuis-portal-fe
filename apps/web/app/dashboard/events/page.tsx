import { EventsClient } from '@/clients/admin/events/events-list.client';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Events Management',
  description: 'Manage all events in the system',
};

export default function EventsPage() {
  return (
    <DashboardLayout title='Event Management'>
      <EventsClient />
    </DashboardLayout>
  );
}
