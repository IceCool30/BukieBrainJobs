import Link from 'next/link';
import Image from 'next/image';
import { Home, Search, Briefcase, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-sans selection:bg-[#ABEEC8] selection:text-[#001A41]">
      {/* Branded Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] rounded-xl"
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
            <span className="text-lg font-extrabold tracking-tight text-[#001A41]">
              BukieBrainJobs
            </span>
          </Link>

          <Link
            href="/services"
            className="text-xs font-semibold text-[#001A41] hover:text-[#296A4B] transition-colors"
          >
            Services Directory
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-bold text-[#059669]">
            <span className="h-2 w-2 rounded-full bg-[#059669]" />
            Status 404: Page not found
          </div>

          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#001A41] sm:text-4xl">
            We could not find that page
          </h1>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
            The page you are looking for may have been moved, renamed, or is temporarily unavailable. Let us help you get back on track.
          </p>

          {/* Quick Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/"
              className="motion-press inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#001A41] px-6 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8]"
            >
              <Home className="h-4 w-4 text-[#ABEEC8]" />
              Return to Homepage
            </Link>

            <Link
              href="/services"
              className="motion-press inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#001A41] transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]"
            >
              <Search className="h-4 w-4 text-[#296A4B]" />
              Browse Services
            </Link>
          </div>

          {/* Helpful Alternatives */}
          <div className="mt-12 border-t border-slate-200/80 pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Other helpful destinations
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
              <Link
                href="/post-job"
                className="flex items-center gap-1.5 hover:text-[#001A41] transition-colors"
              >
                <Briefcase className="h-3.5 w-3.5 text-[#296A4B]" />
                Post a Job Request
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 hover:text-[#001A41] transition-colors"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-[#296A4B]" />
                Customer Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© 2026 BukieBrainJobs. Trusted Nigerian BrainWorker Marketplace.</p>
      </footer>
    </div>
  );
}
