import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Layers,
  Users,
} from 'lucide-react';

const FOCUS_POINTS = [
  {
    icon: Building2,
    title: 'Estates and facilities',
    description: 'For recurring work across buildings, units, and shared spaces.',
  },
  {
    icon: Users,
    title: 'Teams and BrainWorkers',
    description: 'For teams that need a clearer way to coordinate service work with BrainWorkers.',
  },
  {
    icon: Layers,
    title: 'Clearer oversight',
    description: 'A simpler view of requests, costs, and completed work as the service grows.',
  },
];

export default function EnterprisePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B1528] text-slate-900 dark:text-white transition-colors duration-200">
      <section className="relative isolate min-h-[480px] overflow-hidden border-b border-slate-200 dark:border-slate-800 sm:min-h-[580px] transition-colors">
        <Image
          src="/images/enterprise-cityscape-backdrop.jpg"
          alt="Modern business buildings in a city district"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_48%] sm:object-center"
        />

        <div className="relative z-10 mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          <header className="flex min-h-11 items-center justify-between gap-4 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#111927]/95 backdrop-blur-xs px-4 shadow-xs sm:px-5 transition-colors">
            <Link
              href="/"
              className="font-display text-base font-bold tracking-tight text-[#001A41] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] dark:focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
              BukieBrainJobs
            </Link>
            <Link
              href="/services"
              className="motion-press inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#001A41] dark:text-white transition-colors hover:text-[#002866] dark:hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] dark:focus-visible:ring-emerald-400"
            >
              Explore services
              <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </Link>
          </header>

          <div className="flex min-h-[408px] items-end py-8 sm:min-h-[508px] sm:py-14">
            <div className="max-w-xl rounded-lg border border-white/20 dark:border-slate-700/60 bg-black/60 dark:bg-black/75 backdrop-blur-xs p-5 shadow-lg sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#ABEEC8] dark:text-emerald-400">
                <Building2 className="h-3.5 w-3.5" />
                BukieBrainJobs for business
              </div>
              <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
                Business services for recurring work.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] sm:text-lg">
                Coordinate recurring maintenance across properties, teams, and locations with one clear service workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end lg:gap-16">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">Built for recurring work</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              A simpler way to manage recurring work.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Manage property operations, facility needs, and ongoing service coordination in one place.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {FOCUS_POINTS.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111927] p-5 shadow-xs sm:p-6 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-[#081F17] text-emerald-700 dark:text-emerald-400">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111927] transition-colors">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Need a service now?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Explore the services shown for the work you need done today.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
            <Link
              href="/services"
              className="motion-press inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#001A41] dark:bg-emerald-600 px-5 text-sm font-bold text-white dark:text-slate-950 transition-colors hover:bg-[#002661] dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
              Browse services
              <ArrowRight className="h-4 w-4 text-[#ABEEC8] dark:text-slate-950" />
            </Link>
            <Link
              href="/"
              className="motion-press inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1424] px-5 text-sm font-bold text-slate-900 dark:text-white transition-colors hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-[#1A2538] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
