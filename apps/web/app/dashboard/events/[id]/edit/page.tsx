import { EventFormClient } from '@/clients/admin/events/event-form.client';

type EditEventPageProps = {
  params: {
    id: string;
  };
};

export const metadata = {
  title: 'Edit Event',
  description: 'Edit an existing event',
};

export default function EditEventPage({ params }: EditEventPageProps) {
  return <EventFormClient eventId={params.id} />;
}
