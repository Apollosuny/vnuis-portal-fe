import { EventDetailClient } from '@/clients/student/events/event-detail.client';

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <EventDetailClient eventId={params.id} />
    </div>
  );
}
