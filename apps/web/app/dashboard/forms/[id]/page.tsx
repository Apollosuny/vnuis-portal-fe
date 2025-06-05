'use client';

import { FormDetailClient } from '@/clients/admin/forms/FormDetailClient';
import { AdminGuard } from '@/components/guards/admin.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function FormDetailPage() {
  return (
    <DashboardLayout title='Form Details'>
      <AdminGuard>
        <FormDetailClient />
      </AdminGuard>
    </DashboardLayout>
  );
}
