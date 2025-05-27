import FormsPage from '@/clients/student/forms';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <FormsPage />
    </AuthenticatedGuard>
  );
}
