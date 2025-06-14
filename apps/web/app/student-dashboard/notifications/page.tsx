import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import NotificationsPage from '@/clients/student/notifications';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <NotificationsPage />
    </AuthenticatedGuard>
  );
}
