import { FormDetailClient } from '@/clients/student/forms/FormDetailClient';
import { Suspense } from 'react';

export default async function FormDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Suspense fallback={<div>Loading form details...</div>}>
      <FormDetailClient id={params.id} />
    </Suspense>
  );
}
