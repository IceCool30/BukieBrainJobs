'use client';

import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Extend the Window interface to include the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the customized install prompt
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is already installed, no need to show
    window.addEventListener('appinstalled', () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt variable, it can only be used once.
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 flex flex-col gap-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0A192F] flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <h3 className="text-[#0A192F] font-bold text-base">Install BukieBrainJobs</h3>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">
                  Install our free lightweight app for instant access and the best experience.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 w-full mt-1">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
            >
              Maybe later
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-[#0A192F] hover:bg-[#112a4f] transition-all active:scale-95 text-sm flex justify-center items-center gap-2"
            >
              <Download className="w-4 h-4" /> Install App
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
