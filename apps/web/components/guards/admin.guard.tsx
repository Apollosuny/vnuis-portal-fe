'use client';

import { useUserStore } from '../../stores/user.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Role } from '@/types/user.types';
import { ROUTES } from '@/constants/router';

type AdminGuardProps = {
  children: React.ReactNode;
};

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isLoading, isAuthenticated } = useUserStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = () => {
      // Wait for authentication to be determined
      if (isLoading) return;

      // If not authenticated, redirect to login
      if (!isAuthenticated || !user) {
        toast.error('Please login to access this page');
        router.replace(ROUTES.LOGIN);
        setIsChecking(false);
        return;
      }

      // Check if user has admin privileges
      if (user.role !== Role.ADMIN && user.role !== Role.SUPERADMIN) {
        toast.error('You do not have permission to access this page');
        router.replace(ROUTES.DASHBOARD);
        setIsChecking(false);
        return;
      }

      // User has proper access
      setIsChecking(false);
    };

    checkAdminAccess();
  }, [user, isLoading, isAuthenticated, router]);

  // Show loading while checking authentication and permissions
  if (isLoading || isChecking) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2Icon className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  // Don't render anything if user doesn't have access
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPERADMIN)) {
    return null;
  }

  return <>{children}</>;
};
