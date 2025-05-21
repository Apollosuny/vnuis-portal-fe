'use client';

import { useUserStore } from '@/stores/user.store';
import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';

export const AuthenticatedGuard: React.FC<PropsWithChildren> = ({
  children,
}) => {
  // const { jwt, jwtRefresh, user, clean } = useUserStore();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!jwt || !jwtRefresh || !user) {
  //     clean();
  //     router.push('/login');
  //   }
  // }, [jwt, jwtRefresh, user]);

  // if (!jwt || !jwtRefresh || !user) {
  //   return (
  //     <div className='flex h-screen items-center justify-center'>
  //       Please login
  //     </div>
  //   );
  // }
  return <>{children}</>;
};
