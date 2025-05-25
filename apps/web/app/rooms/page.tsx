import { RoomListClient } from '@/clients/admin/room/RoomListClient';
import { AuthenticatedGuard } from '../../components/guards/authenticated.guard';

export const metadata = {
  title: 'Room Management - VirtuUni Nexus',
  description: 'Manage university rooms for classes, labs, and events',
};

export default function RoomsPage() {
  return (
    <AuthenticatedGuard>
      <RoomListClient />
    </AuthenticatedGuard>
  );
}
