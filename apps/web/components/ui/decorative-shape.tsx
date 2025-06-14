'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export interface DecorativeShapeProps {
  className?: string;
  variant?: 'circle' | 'square' | 'triangle' | 'ring' | 'blob';
  color?: 'primary' | 'secondary' | 'accent' | 'blue' | 'purple' | 'pink';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'center';
  isFixed?: boolean;
}

export const DecorativeShape: React.FC<DecorativeShapeProps> = ({
  className = '',
  variant = 'circle',
  color = 'primary',
  size = 'md',
  position = 'top-right',
  isFixed = false,
}) => {
  const { theme } = useTheme();

  const colorClasses = {
    primary: theme === 'dark' ? 'bg-primary/30' : 'bg-primary/20',
    secondary: theme === 'dark' ? 'bg-secondary/30' : 'bg-secondary/20',
    accent: theme === 'dark' ? 'bg-accent/30' : 'bg-accent/20',
    blue: theme === 'dark' ? 'bg-blue-500/30' : 'bg-blue-500/20',
    purple: theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-500/20',
    pink: theme === 'dark' ? 'bg-pink-500/30' : 'bg-pink-500/20',
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
  };

  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  const shapes = {
    circle: 'rounded-full',
    square: 'rounded-md',
    triangle: 'triangle',
    ring: 'rounded-full border-[10px] bg-transparent',
    blob: 'blob',
  };

  const animations = {
    circle: {
      rotate: [0, 360],
      scale: [1, 1.1, 1],
      transition: {
        rotate: {
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        },
        scale: {
          duration: 5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        },
      },
    },
    square: {
      rotate: [0, 10, -10, 0],
      scale: [1, 0.95, 1.05, 1],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    triangle: {
      rotate: [0, -30, 0],
      y: [0, -20, 0],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    ring: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 0.4, 0.7],
      transition: {
        duration: 7,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
    blob: {
      borderRadius: [
        '30% 70% 70% 30% / 30% 30% 70% 70%',
        '60% 40% 30% 70% / 60% 30% 70% 40%',
        '30% 70% 70% 30% / 30% 30% 70% 70%',
      ],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.div
      className={`${colorClasses[color]} ${sizeClasses[size]} ${positionClasses[position]} ${shapes[variant]} ${isFixed ? 'fixed' : 'absolute'} -z-10 filter blur-xl opacity-50 pointer-events-none ${className}`}
      animate={animations[variant]}
    />
  );
};
