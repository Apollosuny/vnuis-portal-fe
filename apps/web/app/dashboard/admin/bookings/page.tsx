import RoomBookingManagementClient from '@/clients/admin/room-booking/RoomBookingManagementClient';
import { AdminGuard } from '@/components/guards/admin.guard';
import { AuthenticatedGuard } from '@/components/guards/authenticated.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Room Booking Management - VirtuUni Nexus',
  description: 'Manage room bookings and requests',
};

export default function RoomBookingsPage() {
  return (
    <DashboardLayout title='Room Booking Management'>
      <AuthenticatedGuard>
        <AdminGuard>
          <RoomBookingManagementClient />
        </AdminGuard>
      </AuthenticatedGuard>
    </DashboardLayout>
  );
}
