import { AdminGuard } from '@/components/guards/admin.guard';
import { AuthenticatedGuard } from '../../../../components/guards/authenticated.guard';
import { EditRoomClient } from '@/clients/room/EditRoomClient';

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
    <AuthenticatedGuard>
      <AdminGuard>
        <EditRoomClient roomId={params.roomId} />
      </AdminGuard>
    </AuthenticatedGuard>
  );
}
