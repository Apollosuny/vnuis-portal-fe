import { StudentListClient } from '@/clients/admin/student/StudentListClient';
import { AuthenticatedGuard } from '../../../components/guards/authenticated.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Student Management - VirtuUni Nexus',
  description: 'Manage university students and their information',
};

export default function StudentsPage() {
  return (
    <DashboardLayout title='Student Management'>
      <AuthenticatedGuard>
        <StudentListClient />
      </AuthenticatedGuard>
    </DashboardLayout>
  );
}
