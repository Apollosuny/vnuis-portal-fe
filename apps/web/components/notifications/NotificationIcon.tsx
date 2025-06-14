'use client';

import { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@workspace/ui/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationList } from './NotificationList';

export const NotificationIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close when clicking outside
  const handleClickOutside = () => {
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <Button
        variant='ghost'
        size='icon'
        className='relative'
        onClick={toggleDropdown}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className='absolute top-0.5 right-0.5 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className='fixed inset-0 z-30'
              onClick={handleClickOutside}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={cn(
                'fixed md:absolute z-50 w-[calc(100vw-2rem)] max-w-sm md:w-96 right-2 top-24 md:top-auto md:mt-2 md:right-0 bg-card border border-border rounded-lg shadow-lg'
              )}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <NotificationList closeFn={handleClickOutside} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
