import { ROUTES } from '@/constants/router';
import { useUserStore } from '@/stores/user.store';
import { useRouter } from 'next/navigation';

export const useLogout = () => {
  const { clean } = useUserStore();
  const router = useRouter();

  const onLogout = () => {
    clean();
    router.push(ROUTES.LOGIN);
  };

  return { onLogout };
};
