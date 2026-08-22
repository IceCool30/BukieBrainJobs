import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Layers,
  ShieldCheck,
  Users,
} from 'lucide-react';

const FOCUS_POINTS = [
  {
    icon: Building2,
    title: 'Estates and facilities',
    description: 'One place for repeated maintenance across buildings, units, and shared spaces.',
  },
  {
    icon: Users,
    title: 'Verified BrainWorkers',
    description: 'Access the same verified workforce your customers already trust for skilled work.',
  },
  {
    icon: Layers,
    title: 'Operational clarity',
    description: 'Clearer request handling, cost visibility, and completion tracking for teams.',
  },
];

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FF] text-[#001A41]">
      <section className="relative overflow-hidden bg-[#001A41] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(171,238,200,0.12),_transparent_55%)]" />
        <div className="relative mx-auto max-w-[1280px] px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ABEEC8]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] lg:items-end">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ABEEC8]/25 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ABEEC8]">
                <Building2 className="h-3.5 w-3.5" />
                For Business
              </div>

              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                Business solutions are coming soon.
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
                We are preparing a path for estates, facilities, and companies that need verified
                BrainWorkers for ongoing maintenance, not only one-off jobs.
              </p>
            </div>

            <aside className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[#ABEEC8]">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-[0.14em]">Coming soon</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-100">
                This area is not open yet. While we build it, the marketplace remains available for
                individual service bookings.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">What is ahead</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#001A41]">
            Built for organizations that manage work at scale.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            When this launches, the goal is the same trust standard as the consumer marketplace,
            with stronger support for teams that raise many requests across locations.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {FOCUS_POINTS.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ABEEC8]/60 bg-[#EAF7EF] text-[#296A4B]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-[#001A41]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:mt-12 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
          <div className="max-w-xl">
            <h2 className="font-display text-xl font-bold tracking-tight text-[#001A41]">
              Need a service today?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Browse available categories and book a verified BrainWorker through the current marketplace.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:shrink-0">
            <Link
              href="/services"
              className="motion-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#001A41] px-5 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
            >
              Browse services
              <ArrowRight className="h-4 w-4 text-[#ABEEC8]" />
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
