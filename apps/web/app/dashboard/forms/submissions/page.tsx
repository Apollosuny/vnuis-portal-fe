'use client';

import FormSubmissionsClient from '@/clients/admin/forms/FormSubmissionsClient';
import { AdminGuard } from '@/components/guards/admin.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function FormSubmissionsPage() {
  return (
    <DashboardLayout title='Form Submissions'>
      <AdminGuard>
        <FormSubmissionsClient />
      </AdminGuard>
    </DashboardLayout>
  );
}
