'use client';

import { Button } from '@workspace/ui/components/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

interface RightSidebarToggleProps {
  className?: string;
}

export const RightSidebarToggle = ({
  className = '',
}: RightSidebarToggleProps) => {
  const { isRightSidebarOpen, toggleRightSidebar } = useUIStore();

  return (
    <motion.div
      className={`absolute -left-4 top-16 z-50 ${className}`}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.92 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15,
      }}
    >
      <Button
        onClick={toggleRightSidebar}
        size='sm'
        variant='secondary'
        className='h-9 w-9 p-0 rounded-full shadow-md border border-border/60 backdrop-blur-sm transition-all duration-300 ease-in-out hover:shadow-glow-subtle'
        title={isRightSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{
            rotate: isRightSidebarOpen ? 0 : 180,
            scale: isRightSidebarOpen ? [1, 1] : [0.9, 1],
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
            duration: 0.4,
          }}
        >
          {isRightSidebarOpen ? (
            <ChevronRight className='text-primary' size={18} />
          ) : (
            <ChevronLeft className='text-primary' size={18} />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
};
