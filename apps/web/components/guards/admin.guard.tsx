'use client';

import { useUserStore } from '../../stores/user.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '@/types/user.types';

type AdminGuardProps = {
  children: React.ReactNode;
};

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isLoading } = useUserStore();
  const router = useRouter();

  // useEffect(() => {
  //   if (
  //     !isLoading &&
  //     user &&
  //     user.role !== Role.ADMIN &&
  //     user.role !== Role.SUPERADMIN
  //   ) {
  //     toast.error('You do not have permission to access this page');
  //     router.push('/dashboard');
  //   }
  // }, [user, isLoading, router]);

  // if (isLoading) {
  //   return (
  //     <div className='flex justify-center items-center h-64'>
  //       <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
  //     </div>
  //   );
  // }

  // if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPERADMIN)) {
  //   return null;
  // }

  return <>{children}</>;
};
