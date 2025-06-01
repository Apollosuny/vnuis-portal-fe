'use client';

import { useUserStore } from '../../stores/user.store';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { ROUTES } from '@/constants/router';

export const RootGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const { jwt, jwtRefresh, user, isAuthenticated, isLoading } = useUserStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        const isLoggedIn = jwt && jwtRefresh && user && isAuthenticated;

        if (isLoggedIn) {
          if (user.role === 'ADMIN' || user.role === 'SUPERADMIN') {
            router.replace(ROUTES.DASHBOARD);
          } else if (user.role === 'STUDENT') {
            router.replace(ROUTES.STUDENT_DASHBOARD);
          }
        } else {
          router.replace(ROUTES.LOGIN);
        }

        setIsChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isLoading, jwt, jwtRefresh, user, isAuthenticated, router]);

  if (isLoading || isChecking) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return null;
};
