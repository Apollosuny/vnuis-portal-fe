import DashboardPage from '@/clients/admin/dashboard';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <DashboardPage />
    </AuthenticatedGuard>
  );
}
