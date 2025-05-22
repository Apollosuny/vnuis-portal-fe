'use client';

import { useUserStore } from '../../stores/user.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';

type AdminGuardProps = {
  children: React.ReactNode;
};

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // if (!isLoading && user && user.role !== 'ADMIN') {
    //   toast.error('You do not have permission to access this page');
    //   router.push('/rooms');
    // }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
};
