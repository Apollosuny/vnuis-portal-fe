import { StudentEditClient } from '@/clients/admin/student/StudentEditClient';
import { AuthenticatedGuard } from '../../../../../components/guards/authenticated.guard';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata = {
  title: 'Edit Student - VirtuUni Nexus',
  description: 'Edit student information',
};

export default function EditStudentPage() {
  return (
    <DashboardLayout title='Edit Student'>
      <AuthenticatedGuard>
        <StudentEditClient />
      </AuthenticatedGuard>
    </DashboardLayout>
  );
}
