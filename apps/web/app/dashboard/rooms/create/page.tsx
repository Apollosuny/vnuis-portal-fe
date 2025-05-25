import { AdminGuard } from '@/components/guards/admin.guard';
import { AuthenticatedGuard } from '../../../../components/guards/authenticated.guard';
import { RoomFormClient } from '@/clients/admin/room/RoomFormClient';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Create Room - VirtuUni Nexus',
  description: 'Create a new room in the system',
};

export default function CreateRoomPage() {
  return (
    // <AuthenticatedGuard>
    //   <AdminGuard>
    //     <RoomFormClient />
    //   </AdminGuard>
    // </AuthenticatedGuard>
    <DashboardLayout title='Create Room'>
      <RoomFormClient />
    </DashboardLayout>
  );
}
