'use client';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { useUserStore } from '@/stores/user.store';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useLogout } from '@/hooks/useLogout';
import { useRouter } from 'next/navigation';

export function UserAvatar() {
  const { user } = useUserStore();
  const { onLogout } = useLogout();

  const getInitials = () => {
    if (!user || !user.username) return 'U';

    if (user.username.includes('@')) {
      return user.username?.split('@')[0]?.charAt(0)?.toUpperCase() || 'U';
    }

    return user.username.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    if (!user || !user.username) return 'User';
    return user.username;
  };

  if (!user) {
    return (
      <Avatar>
        <AvatarFallback className='bg-primary text-primary-foreground'>
          U
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
          <Avatar>
            <AvatarFallback className='bg-primary text-primary-foreground'>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end'>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {getDisplayName()}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {user.role || 'User'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className='mr-2 h-4 w-4' />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className='mr-2 h-4 w-4' />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className='mr-2 h-4 w-4' />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
