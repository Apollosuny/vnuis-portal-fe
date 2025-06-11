import FormSubmissionDetailClient from '@/clients/admin/forms/FormSubmissionDetailClient';
import { AdminGuard } from '@/components/guards/admin.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Suspense } from 'react';

export default async function FormSubmissionDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  return (
    <DashboardLayout>
      <AdminGuard>
        <Suspense fallback={<div>Loading submission details...</div>}>
          <FormSubmissionDetailClient id={params.id} />
        </Suspense>
      </AdminGuard>
    </DashboardLayout>
  );
}
