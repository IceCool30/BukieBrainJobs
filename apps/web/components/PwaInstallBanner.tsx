'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = localStorage.getItem('bukie_pwa_banner_dismissed');
    if (isDismissed) return;

    // Detect iOS safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      ((window.navigator as Navigator & { standalone?: boolean }).standalone === true);

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      setShowBanner(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      alert('To install: Tap the Share button at the bottom of Safari, then select "Add to Home Screen".');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('bukie_pwa_banner_dismissed', 'true');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-[#001A41] text-white p-4 rounded-2xl shadow-2xl border border-[#296A4B]/60 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 md:hidden">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 relative rounded-xl overflow-hidden border border-[#296A4B] bg-white p-1 shrink-0">
          <Image
            src="/images/logo-icon.png"
            alt="BukieBrainJobs App"
            width={44}
            height={44}
            className="object-contain"
          />
        </div>
        <div className="min-w-0">
          <div className="font-display font-bold text-xs sm:text-sm text-white tracking-tight flex items-center gap-1.5 truncate">
            <span>Install BukieBrainJobs</span>
            <span className="bg-[#296A4B] text-[#ABEEC8] text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
              App
            </span>
          </div>
          <p className="text-[11px] text-slate-300 truncate">
            Fast 1-tap bookings &amp; live job alerts
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-3.5 py-2 bg-[#296A4B] hover:bg-[#1F523A] active:bg-[#17402C] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
        >
          {isIos ? <Smartphone className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span>{isIos ? 'Install' : 'Get App'}</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          aria-label="Dismiss app banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
