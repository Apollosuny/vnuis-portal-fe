import { EventDetailsClient } from '@/clients/admin/events/event-details.client';

type EventDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata = {
  title: 'Event Details',
  description: 'View event details and manage registrations',
};

export default async function EventDetailsPage(props: EventDetailsPageProps) {
  const params = await props.params;
  return <EventDetailsClient eventId={params.id} />;
}
