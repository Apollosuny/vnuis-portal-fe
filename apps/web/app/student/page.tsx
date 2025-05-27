import StudentDashboardPage from '@/clients/student/dashboard';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <StudentDashboardPage />
    </AuthenticatedGuard>
  );
}
