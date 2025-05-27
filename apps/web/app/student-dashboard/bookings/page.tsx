import BookingsPage from '@/clients/student/bookings';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';

export default function Page() {
  return (
    <AuthenticatedGuard>
      <BookingsPage />
    </AuthenticatedGuard>
  );
}
