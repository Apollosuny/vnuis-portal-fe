import { StudentDetailClient } from '@/clients/admin/student/StudentDetailClient';
import { AuthenticatedGuard } from '../../../../components/guards/authenticated.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Student Details - VirtuUni Nexus',
  description: 'View and manage student information',
};

export default function StudentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <DashboardLayout title='Student Details'>
      <AuthenticatedGuard>
        <StudentDetailClient />
      </AuthenticatedGuard>
    </DashboardLayout>
  );
}
