import { AdminGuard } from '@/components/guards/admin.guard';
import { RoomFormClient } from '../../../clients/room/RoomFormClient';
import { AuthenticatedGuard } from '../../../components/guards/authenticated.guard';

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
    <RoomFormClient />
  );
}
