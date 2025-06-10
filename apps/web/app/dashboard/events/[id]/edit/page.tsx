import { EventFormClient } from '@/clients/admin/events/event-form.client';

type EditEventPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata = {
  title: 'Edit Event',
  description: 'Edit an existing event',
};

export default async function EditEventPage(props: EditEventPageProps) {
  const params = await props.params;
  return <EventFormClient eventId={params.id} />;
}
