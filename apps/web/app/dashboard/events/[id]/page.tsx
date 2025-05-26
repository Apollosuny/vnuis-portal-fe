import { EventDetailsClient } from '@/clients/admin/events/event-details.client';

type EventDetailsPageProps = {
  params: {
    id: string;
  };
};

export const metadata = {
  title: 'Event Details',
  description: 'View event details and manage registrations',
};

export default function EventDetailsPage({ params }: EventDetailsPageProps) {
  return <EventDetailsClient eventId={params.id} />;
}
