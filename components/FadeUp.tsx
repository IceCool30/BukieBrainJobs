'use client';
import { motion, HTMLMotionProps } from 'framer-motion';
import React, { ElementType, useState, useEffect } from 'react';

interface FadeUpProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down';
  className?: string;
  as?: ElementType;
}

export function FadeUp({ children, delay = 0, direction = 'up', className = '', ...props }: FadeUpProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const yOffset = direction === 'up' ? 20 : -20;
  
  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ 
        type: "spring",
        stiffness: 110,
        damping: 15,
        mass: 0.9,
        delay 
      }}
      className={className}
      layout
      {...props}
    >
      {children}
    </motion.div>
  );
}
