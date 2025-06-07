import FormSubmissionDetailClient from '@/clients/admin/forms/FormSubmissionDetailClient';
import { AdminGuard } from '@/components/guards/admin.guard';
import { Suspense } from 'react';

export default function FormSubmissionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AdminGuard>
      <Suspense fallback={<div>Loading submission details...</div>}>
        <FormSubmissionDetailClient id={params.id} />
      </Suspense>
    </AdminGuard>
  );
}
