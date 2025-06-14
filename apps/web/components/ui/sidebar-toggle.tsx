'use client';

import { Button } from '@workspace/ui/components/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

interface SidebarToggleProps {
  className?: string;
}

export const SidebarToggle = ({ className = '' }: SidebarToggleProps) => {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <motion.div
      className={`absolute -right-4 top-16 z-50 ${className}`}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.92 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15,
      }}
    >
      <Button
        onClick={toggleSidebar}
        size='sm'
        variant='secondary'
        className='h-9 w-9 p-0 rounded-full shadow-md border border-border/60 backdrop-blur-sm transition-all duration-300 ease-in-out hover:shadow-glow-subtle'
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <motion.div
          initial={{ rotate: 0 }}
          animate={{
            rotate: isSidebarCollapsed ? 0 : 180,
            scale: isSidebarCollapsed ? [0.9, 1] : [1, 1],
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
            duration: 0.4,
          }}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className='text-primary' size={18} />
          ) : (
            <ChevronLeft className='text-primary' size={18} />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
};
