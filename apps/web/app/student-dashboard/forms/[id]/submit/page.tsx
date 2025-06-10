import { FormSubmitClient } from '@/clients/student/forms/FormSubmitClient';
import { Suspense } from 'react';

export default async function FormSubmitPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <FormSubmitClient id={params.id} />
    </Suspense>
  );
}
