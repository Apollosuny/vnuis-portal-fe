'use client';

import { useUserStore } from '../../stores/user.store';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { Loader2Icon } from 'lucide-react';

export const AuthenticatedGuard: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { jwt, jwtRefresh, user, isAuthenticated, isLoading } = useUserStore();
  const router = useRouter();

  // useEffect(() => {
  //   if (!isLoading && (!jwt || !jwtRefresh || !user || !isAuthenticated)) {
  //     router.push('/login');
  //   }
  // }, [jwt, jwtRefresh, user, isAuthenticated, isLoading, router]);

  // if (isLoading) {
  //   return (
  //     <div className='flex h-screen items-center justify-center'>
  //       <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
  //     </div>
  //   );
  // }

  // if (!jwt || !jwtRefresh || !user || !isAuthenticated) {
  //   return (
  //     <div className='flex h-screen items-center justify-center'>
  //       <p className='text-lg'>Please login to continue</p>
  //     </div>
  //   );
  // }

  return <>{children}</>;
};
