'use client';
import { motion, HTMLMotionProps } from 'motion/react';
import React, { ElementType } from 'react';

interface FadeUpProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down';
  className?: string;
  as?: ElementType;
}

export function FadeUp({ children, delay = 0, direction = 'up', className = '', ...props }: FadeUpProps) {
  const yOffset = direction === 'up' ? 20 : -20;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
