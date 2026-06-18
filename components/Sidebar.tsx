'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavigation = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-end p-4 border-b border-gray-100">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-[#0A192F] hover:bg-gray-50 rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Links */}
            <nav className="flex-1 px-6 py-8 flex flex-col gap-6">
              <button
                onClick={() => handleNavigation('/')}
                className="text-left text-2xl font-extrabold text-[#0A192F] tracking-tight hover:text-[#004D2C] transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('/about')}
                className="text-left text-2xl font-extrabold text-[#0A192F] tracking-tight hover:text-[#004D2C] transition-colors"
              >
                About Us
              </button>
              <button
                onClick={() => handleNavigation('/login')}
                className="text-left text-2xl font-extrabold text-[#0A192F] tracking-tight hover:text-[#004D2C] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/post-job')}
                className="text-left text-2xl font-extrabold text-[#0A192F] tracking-tight hover:text-[#004D2C] transition-colors"
              >
                Post a Task
              </button>
            </nav>

            {/* Footer Links */}
            <div className="p-6 bg-gray-50 flex flex-col gap-4">
              <button
                onClick={() => handleNavigation('/legal/terms')}
                className="text-left text-sm font-medium text-gray-500 hover:text-[#0A192F] transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => handleNavigation('/legal/privacy')}
                className="text-left text-sm font-medium text-gray-500 hover:text-[#0A192F] transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => handleNavigation('/legal/cookies')}
                className="text-left text-sm font-medium text-gray-500 hover:text-[#0A192F] transition-colors"
              >
                Cookie Policy
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
