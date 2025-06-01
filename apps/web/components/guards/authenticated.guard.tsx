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
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (!jwt || !jwtRefresh || !user || !isAuthenticated) {
          router.replace(ROUTES.LOGIN);
          setCheckingAuth(false);
          return;
        }

        const pathname = window.location.pathname;

        if (pathname === '/' || pathname === ROUTES.LOGIN) {
          console.log('user role', user.role);
          if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
            router.replace(ROUTES.DASHBOARD);
          } else if (user.role === 'STUDENT') {
            router.replace(ROUTES.STUDENT_DASHBOARD);
          }
        }

        setCheckingAuth(false);
      }
    }, 500);

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
