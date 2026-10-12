'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WifiOff, RefreshCw, ArrowLeft, ShieldCheck, PhoneCall, LayoutDashboard } from 'lucide-react';

export default function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [retryNotice, setRetryNotice] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleRetry = () => {
    setIsChecking(true);
    setRetryNotice(null);

    // If online, reload immediately
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      window.location.reload();
      return;
    }

    setTimeout(() => {
      setIsChecking(false);
      setRetryNotice('Still offline. Please check your internet or mobile data connection.');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1528] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111927] transition-colors">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center gap-2 font-display text-base font-extrabold tracking-tight text-[#001A41] dark:text-white rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] dark:focus-visible:ring-emerald-400"
          >
            <Image
              src="/images/logo-icon.png"
              alt="BukieBrainJobs"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span>
              Bukie<span className="text-emerald-600 dark:text-emerald-400">BrainJobs</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-[#20180B] px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-400">
            <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>Offline</span>
          </div>
        </div>
      </header>

      {/* Main Offline Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111927] p-6 sm:p-10 shadow-xs transition-colors">
          {/* Subtle Trademark Watermark */}
          <div
            className="pointer-events-none absolute -right-8 -bottom-10 opacity-[0.03] select-none"
            aria-hidden="true"
          >
            <Image
              src="/images/logo-badge-512.png"
              alt=""
              width={260}
              height={260}
              className="object-contain"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#001A41]/5 dark:bg-emerald-500/10 text-[#001A41] dark:text-emerald-400 border border-slate-200/80 dark:border-slate-800 mb-5">
              <WifiOff className="h-8 w-8 text-[#001A41] dark:text-emerald-400" aria-hidden="true" />
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              You&apos;re Currently Offline
            </h1>
            <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 sm:text-base max-w-md">
              BukieBrainJobs is ready as soon as your connection returns. Your device is disconnected from the network.
            </p>

            {retryNotice && (
              <div
                role="status"
                className="mt-4 w-full rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-[#20180B] p-3 text-xs font-medium text-amber-800 dark:text-amber-300 animate-in fade-in duration-200"
              >
                {retryNotice}
              </div>
            )}

            {/* Offline Reassurances */}
            <div className="mt-6 w-full space-y-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0D1424] p-4 text-left text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  Your drafts and prepared booking requests are safely stored on this device and will not be lost.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <PhoneCall className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  Direct BrainWorker phone calls and SMS remain available via your phone carrier network.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <LayoutDashboard className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  Cached dashboard and past service requests remain viewable without active data.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col w-full gap-3">
              <button
                type="button"
                onClick={handleRetry}
                disabled={isChecking}
                className="motion-press flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 px-6 text-sm font-bold text-white dark:text-slate-950 transition-colors shadow-xs disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{isChecking ? 'Checking Connection...' : 'Retry Connection'}</span>
              </button>

              <Link
                href="/dashboard?state=offline"
                className="motion-press flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1424] px-6 text-sm font-bold text-slate-900 dark:text-white transition-colors hover:bg-slate-50 dark:hover:bg-[#1A2538] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] dark:focus-visible:ring-emerald-400"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span>View Cached Dashboard</span>
              </Link>

              <Link
                href="/"
                className="motion-press inline-flex min-h-10 items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mt-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
