'use client';

import { FormsListClient } from '@/clients/admin/forms/FormsListClient';
import { AdminGuard } from '@/components/guards/admin.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function FormsPage() {
  return (
    <DashboardLayout title='Administrative Procedures'>
      <AdminGuard>
        <FormsListClient />
      </AdminGuard>
    </DashboardLayout>
  );
}
