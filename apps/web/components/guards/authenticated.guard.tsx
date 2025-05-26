'use client';

import { useUserStore } from '../../stores/user.store';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { ROUTES } from '@/constants/router';

export const AuthenticatedGuard: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { jwt, jwtRefresh, user, isAuthenticated, isLoading } = useUserStore();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Đặt timeout để đảm bảo dữ liệu được tải đầy đủ
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (!jwt || !jwtRefresh || !user || !isAuthenticated) {
          router.push(ROUTES.LOGIN);
        }
        setCheckingAuth(false);
      }
    }, 500); // Chờ 500ms

    return () => clearTimeout(timer);
  }, [isLoading, jwt, jwtRefresh, user, isAuthenticated, router]);

  if (isLoading || checkingAuth) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!jwt || !jwtRefresh || !user || !isAuthenticated) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='text-lg'>Please login to continue</p>
      </div>
    );
  }

  return <>{children}</>;
};
