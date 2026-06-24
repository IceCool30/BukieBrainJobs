'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

interface SmoothCollapseProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SmoothCollapse({ isOpen, children, className = '' }: SmoothCollapseProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
