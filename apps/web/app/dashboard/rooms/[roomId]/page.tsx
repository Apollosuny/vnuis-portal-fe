import { RoomDetailClient } from '@/clients/admin/room/RoomDetailClient';
import { AuthenticatedGuard } from '../../../../components/guards/authenticated.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Room Details - VirtuUni Nexus',
  description: 'View room details',
};

type RoomDetailPageProps = {
  params: {
    roomId: string;
  };
};

export default function RoomDetailPage({ params }: RoomDetailPageProps) {
  return (
    <DashboardLayout title={`Room Details - ${params.roomId}`}>
      <AuthenticatedGuard>
        <RoomDetailClient roomId={params.roomId} />
      </AuthenticatedGuard>
    </DashboardLayout>
  );
}
