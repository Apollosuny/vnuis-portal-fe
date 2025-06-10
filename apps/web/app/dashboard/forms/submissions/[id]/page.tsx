import FormSubmissionDetailClient from '@/clients/admin/forms/FormSubmissionDetailClient';
import { AdminGuard } from '@/components/guards/admin.guard';
import { Suspense } from 'react';

export default async function FormSubmissionDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  return (
    <AdminGuard>
      <Suspense fallback={<div>Loading submission details...</div>}>
        <FormSubmissionDetailClient id={params.id} />
      </Suspense>
    </AdminGuard>
  );
}
