import NotificationManagementPage from '@/clients/admin/notifications';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <NotificationManagementPage />
    </AuthenticatedGuard>
  );
}
