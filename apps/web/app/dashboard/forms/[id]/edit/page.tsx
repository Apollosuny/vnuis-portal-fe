'use client';

import { FormEditClient } from '@/clients/admin/forms/FormEditClient';
import { AdminGuard } from '@/components/guards/admin.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function FormEditPage() {
  return (
    <DashboardLayout title='Edit Form'>
      <AdminGuard>
        <FormEditClient />
      </AdminGuard>
    </DashboardLayout>
  );
}
