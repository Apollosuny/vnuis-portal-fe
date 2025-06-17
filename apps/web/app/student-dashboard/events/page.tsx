'use client';

import { StudentEventsClient } from '@/clients/student/events';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <StudentDashboardLayout>
        <StudentEventsClient />
      </StudentDashboardLayout>
    </AuthenticatedGuard>
  );
}
