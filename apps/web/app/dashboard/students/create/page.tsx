import { StudentCreateClient } from '@/clients/admin/student/StudentCreateClient';
import { AuthenticatedGuard } from '../../../../components/guards/authenticated.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Create Student - VirtuUni Nexus',
  description: 'Add a new student to the system',
};

export default function CreateStudentPage() {
  return (
    <DashboardLayout title='Create New Student'>
      <AuthenticatedGuard>
        <StudentCreateClient />
      </AuthenticatedGuard>
    </DashboardLayout>
  );
}
