'use client';

import { useUserStore } from '../../stores/user.store';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { ROUTES } from '@/constants/router';

export const LoginGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const { jwt, jwtRefresh, user, isAuthenticated, isLoading } = useUserStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Chờ store được hydrate
    const timer = setTimeout(() => {
      if (!isLoading) {
        const isLoggedIn = jwt && jwtRefresh && user && isAuthenticated;

        if (isLoggedIn) {
          // Đã đăng nhập -> redirect về dashboard
          router.replace(ROUTES.DASHBOARD);
          return;
        }

        setIsChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, jwt, jwtRefresh, user, isAuthenticated, router]);

  // Hiển thị loading spinner trong khi kiểm tra auth
  if (isLoading || isChecking) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  // Render children nếu chưa đăng nhập
  return <>{children}</>;
};
