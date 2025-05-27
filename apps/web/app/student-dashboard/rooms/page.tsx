import RoomsPage from '@/clients/student/rooms';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <RoomsPage />
    </AuthenticatedGuard>
  );
}
