'use client';

import { motion } from 'framer-motion';

export interface AnimatedIconProps {
  icon: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animationType?: 'bounce' | 'pulse' | 'shake' | 'spin';
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon,
  className = '',
  size = 'md',
  animationType = 'bounce',
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const animations = {
    bounce: {
      y: [0, -4, 0],
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
    shake: {
      rotate: [0, -3, 3, -3, 0],
      transition: {
        duration: 1.3,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop' as const,
        repeatDelay: 1,
      },
    },
    spin: {
      rotate: [0, 360],
      transition: {
        duration: 3,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  };

  return (
    <div
      className={`inline-flex items-center justify-center w-full h-full ${className}`}
    >
      <motion.div
        className={`inline-flex items-center justify-center ${sizeClass}`}
        animate={animations[animationType]}
      >
        {icon}
      </motion.div>
    </div>
  );
};
