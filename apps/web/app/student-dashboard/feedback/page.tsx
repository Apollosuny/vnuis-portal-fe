import StudentFeedbackPage from '@/clients/student/feedback';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import StudentDashboardLayout from '@/components/layouts/StudentDashboardLayout';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <StudentDashboardLayout>
        <StudentFeedbackPage />
      </StudentDashboardLayout>
    </AuthenticatedGuard>
  );
}
