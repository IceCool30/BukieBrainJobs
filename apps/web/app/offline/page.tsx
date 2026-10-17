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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="border-b border-[var(--lead)] bg-[var(--card-bg)] transition-colors">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center gap-2 font-display text-base font-extrabold tracking-tight text-[var(--text-main)] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
          >
            <Image
              src="/images/logo-icon.png"
              alt="BukieBrainJobs"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain"
            />
          </Link>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-[var(--amber)]/30 bg-[var(--amber-dim)] px-2.5 py-1 text-xs font-semibold text-[var(--amber)]">
              <WifiOff className="h-3.5 w-3.5 text-[var(--amber)]" aria-hidden="true" />
              <span>Offline</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Offline Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 sm:p-10 shadow-xs transition-colors">
          {/* Subtle Trademark Watermark */}
          <div
            className="pointer-events-none absolute -right-8 -bottom-10 opacity-[0.03] select-none"
            aria-hidden="true"
          >
            <Image
              src="/images/logo-watermark.png"
              alt=""
              width={260}
              height={260}
              className="object-contain"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--tag-bg)] text-[var(--amber)] border border-[var(--lead)] mb-5">
              <WifiOff className="h-8 w-8 text-[var(--amber)]" aria-hidden="true" />
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--text-main)] sm:text-3xl">
              You&apos;re Currently Offline
            </h1>
            <p className="mt-2.5 text-sm text-[var(--text-muted)] sm:text-base max-w-md">
              BukieBrainJobs is ready as soon as your connection returns. Your device is disconnected from the network.
            </p>

            {retryNotice && (
              <div
                role="status"
                className="mt-4 w-full rounded-lg border border-[var(--amber)]/30 bg-[var(--amber-dim)] p-3 text-xs font-medium text-[var(--amber)] animate-in fade-in duration-200"
              >
                {retryNotice}
              </div>
            )}

            {/* Offline Reassurances */}
            <div className="mt-6 w-full space-y-3 rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] p-4 text-left text-xs sm:text-sm text-[var(--text-muted)]">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[var(--brand-green)] mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  Your drafts and prepared booking requests are safely stored on this device and will not be lost.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <PhoneCall className="h-4 w-4 text-[var(--brand-green)] mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  Direct BrainWorker phone calls and SMS remain available via your phone carrier network.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <LayoutDashboard className="h-4 w-4 text-[var(--brand-green)] mt-0.5 shrink-0" aria-hidden="true" />
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
                className="motion-press flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--amber)] hover:bg-[var(--amber-hover)] px-6 text-sm font-bold text-white transition-colors shadow-xs disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
              >
                <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{isChecking ? 'Checking Connection...' : 'Retry Connection'}</span>
              </button>

              <Link
                href="/dashboard?state=offline"
                className="motion-press flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] px-6 text-sm font-bold text-[var(--text-main)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span>View Cached Dashboard</span>
              </Link>

              <Link
                href="/"
                className="motion-press inline-flex min-h-10 items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors mt-1"
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
