'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, Briefcase, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] flex flex-col font-sans selection:bg-[var(--amber)] selection:text-white transition-colors duration-200">
      {/* Branded Header */}
      <header className="w-full border-b border-[var(--lead)] bg-[var(--card-bg)]/90 backdrop-blur-md px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] rounded-xl"
            aria-label="BukieBrainJobs Home"
          >
            <Image
              src="/images/logo-icon.png"
              alt="BukieBrainJobs Logo"
              width={38}
              height={38}
              className="rounded-xl shadow-sm"
              priority
            />
            <span className="text-lg font-extrabold tracking-tight text-[var(--text-main)]">
              BukieBrainJobs
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/services"
              className="text-xs font-semibold text-[var(--text-main)] hover:text-[var(--brand-green)] transition-colors"
            >
              Services Directory
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-green-border)] bg-[var(--brand-green-dim)] px-3.5 py-1 text-xs font-bold text-[var(--brand-green)]">
            <span className="h-2 w-2 rounded-full bg-[var(--brand-green)]" />
            Status 404: Page not found
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[var(--text-main)] sm:text-4xl">
            We could not find that page
          </h1>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--text-muted)]">
            The page you are looking for may have been moved, renamed, or is temporarily unavailable. Let us help you get back on track.
          </p>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="motion-press inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--amber)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--amber-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
            >
              <Home className="h-4 w-4 text-[#ABEEC8]" />
              Return to Homepage
            </Link>

            <Link
              href="/services"
              className="motion-press inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--lead)] bg-[var(--card-bg)] px-6 text-sm font-bold text-[var(--text-main)] transition-colors hover:bg-[var(--card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]"
            >
              <Search className="h-4 w-4 text-[var(--brand-green)]" />
              Browse Services
            </Link>
          </div>

          {/* Helpful Alternatives */}
          <div className="mt-12 border-t border-[var(--lead)] pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Other helpful destinations
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[var(--text-muted)]">
              <Link
                href="/post-job"
                className="flex items-center gap-1.5 hover:text-[var(--text-main)] transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5 text-[var(--brand-green)]" />
                Post a Job Request
              </Link>
              <span className="text-[var(--lead)]">•</span>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 hover:text-[var(--text-main)] transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-[var(--brand-green)]" />
                Customer Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="border-t border-[var(--lead)] bg-[var(--card-bg)] py-6 text-center text-xs text-[var(--text-muted)]">
        <p>© 2026 BukieBrainJobs. Trusted Nigerian BrainWorker Marketplace.</p>
      </footer>
    </div>
  );
}
