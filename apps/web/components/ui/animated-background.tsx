'use client';

import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type Bubble = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
};

export interface AnimatedBackgroundProps {
  children: React.ReactNode;
  bubbleCount?: number;
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  children,
  bubbleCount = 15,
  className = '',
}) => {
  const { theme } = useTheme();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Generate bubbles on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Initial dimensions
    updateDimensions();

    // Listen for resize events
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Generate bubbles when dimensions change
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const newBubbles = Array.from({ length: bubbleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: Math.random() * 80 + 20,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 15,
    }));

    setBubbles(newBubbles);
  }, [dimensions, bubbleCount]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Animated bubbles in the background */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className={`absolute rounded-full opacity-5 ${
            theme === 'dark' ? 'bg-blue-300' : 'bg-purple-500'
          }`}
          style={{
            width: bubble.size,
            height: bubble.size,
            left: Math.min(bubble.x, dimensions.width - bubble.size),
            top: bubble.y,
            zIndex: 0,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0.9, 1.1, 1],
            opacity: [0, 0.05, 0.08, 0.05, 0],
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * -200 - 50],
          }}
          transition={{
            duration: bubble.duration,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: bubble.delay,
            times: [0, 0.2, 0.5, 0.8, 1],
          }}
        />
      ))}

      {/* Content layer */}
      <div className='relative z-10 w-full h-full'>{children}</div>
    </div>
  );
};
