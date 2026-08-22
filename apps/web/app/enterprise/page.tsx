import Link from 'next/link';
import { ArrowLeft, Building2, Clock } from 'lucide-react';

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FF] text-[#001A41]">
      <section className="bg-[#001A41] text-white">
        <div className="mx-auto max-w-[1280px] px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ABEEC8]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mt-8 max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ABEEC8]">
              <Building2 className="h-3.5 w-3.5" />
              For Business
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Business solutions are coming soon.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
              BukieBrainJobs will later support estates, facilities, and companies that need
              repeated maintenance across sites. That product path is planned, not available yet.
            </p>

            <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100">
              <Clock className="h-3.5 w-3.5 text-[#ABEEC8]" />
              Not part of the first public launch
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-8">
          <h2 className="font-display text-xl font-bold tracking-tight text-[#001A41]">
            What this will be for
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Organizations that manage multiple properties or ongoing maintenance requests, and want
            access to verified BrainWorkers with clearer operational control than one-off consumer bookings.
          </p>

          <p className="mt-5 text-sm leading-6 text-slate-600">
            Until then, the live product focus is the consumer marketplace: find a service, discover
            BrainWorkers, and complete a booking with trust controls.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/services"
              className="motion-press inline-flex min-h-11 items-center justify-center rounded-xl bg-[#001A41] px-5 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
            >
              Browse services
            </Link>
            <Link
              href="/"
              className="motion-press inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-[#001A41] transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
