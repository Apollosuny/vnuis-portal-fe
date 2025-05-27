import LoginPage from '@/clients/auth';
import { LoginGuard } from '@/components/guards/login.guard';

const Page: React.FC = () => {
  return (
    <LoginGuard>
      <LoginPage />
    </LoginGuard>
  );
};

export default Page;
