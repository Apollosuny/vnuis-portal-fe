import { AdminGuard } from '@/components/guards/admin.guard';
import { AuthenticatedGuard } from '../../../../../components/guards/authenticated.guard';
import { EditRoomClient } from '@/clients/admin/room/EditRoomClient';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Edit Room - VirtuUni Nexus',
  description: 'Edit room details',
};

type EditRoomPageProps = {
  params: {
    roomId: string;
  };
};

export default function EditRoomPage({ params }: EditRoomPageProps) {
  return (
    <DashboardLayout title={`Edit Room - ${params.roomId}`}>
      <AuthenticatedGuard>
        <AdminGuard>
          <EditRoomClient roomId={params.roomId} />
        </AdminGuard>
      </AuthenticatedGuard>
    </DashboardLayout>
  );
}
