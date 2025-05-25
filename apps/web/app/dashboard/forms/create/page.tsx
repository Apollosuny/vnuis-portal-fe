'use client';

import { AdminGuard } from '@/components/guards/admin.guard';
import { FormCreationClient } from '@/clients/admin/forms/FormCreationClient';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function CreateFormPage() {
  return (
    <DashboardLayout title='Create Form'>
      <AdminGuard>
        <FormCreationClient />
      </AdminGuard>
    </DashboardLayout>
  );
}
