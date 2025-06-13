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
      className={`absolute -right-4 top-1/2 -translate-y-1/2 z-50 ${className}`}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        onClick={toggleSidebar}
        size='sm'
        variant='secondary'
        className='h-8 w-8 p-0 rounded-full shadow-md border'
        title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <motion.div
          animate={{ rotate: isSidebarCollapsed ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </motion.div>
      </Button>
    </motion.div>
  );
};
