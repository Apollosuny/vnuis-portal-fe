import { FormSubmitClient } from '@/clients/student/forms/FormSubmitClient';
import { Suspense } from 'react';

export default function FormSubmitPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <FormSubmitClient id={params.id} />
    </Suspense>
  );
}
