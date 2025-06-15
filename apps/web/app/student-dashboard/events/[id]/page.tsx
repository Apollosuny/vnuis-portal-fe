import { EventDetailClient } from '@/clients/student/events/event-detail.client';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';

export default async function EventPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  return (
    <StudentDashboardLayout>
      <EventDetailClient eventId={params.id} />
    </StudentDashboardLayout>
  );
}
