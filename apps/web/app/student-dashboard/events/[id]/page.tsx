import { EventDetailClient } from '@/clients/student/events/event-detail.client';

export default async function EventPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <div>
      <EventDetailClient eventId={params.id} />
    </div>
  );
}
