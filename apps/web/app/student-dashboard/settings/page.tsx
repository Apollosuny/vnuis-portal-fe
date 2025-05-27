import SettingsPage from '@/clients/student/settings';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <SettingsPage />
    </AuthenticatedGuard>
  );
}
