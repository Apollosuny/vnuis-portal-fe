import { RoomDetailClient } from '../../../clients/room/RoomDetailClient';
import { AuthenticatedGuard } from '../../../../components/guards/authenticated.guard';

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
    <AuthenticatedGuard>
      <RoomDetailClient roomId={params.roomId} />
    </AuthenticatedGuard>
  );
}
