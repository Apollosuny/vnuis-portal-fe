import { RoomListClient } from '@/clients/admin/room/RoomListClient';
import { AuthenticatedGuard } from '../../../components/guards/authenticated.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Room Management - VirtuUni Nexus',
  description: 'Manage university rooms for classes, labs, and events',
};

export default function RoomsPage() {
  return (
    <DashboardLayout title='Room Management'>
      <AuthenticatedGuard>
        <RoomListClient />
      </AuthenticatedGuard>
    </DashboardLayout>
  );
}
