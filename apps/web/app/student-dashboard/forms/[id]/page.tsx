import { FormDetailClient } from '@/clients/admin/forms/FormDetailClient';
import { Suspense } from 'react';

export default function FormDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div>Loading form details...</div>}>
      <FormDetailClient />
    </Suspense>
  );
}
