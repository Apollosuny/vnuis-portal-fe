'use client';

// Import the enhanced version of the StudentEventsClient
import { StudentEventsClient } from '@/clients/student/events/student-events-enhanced.client';
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
