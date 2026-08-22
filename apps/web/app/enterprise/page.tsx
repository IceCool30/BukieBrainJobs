import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ClipboardList,
  Mail,
  ShieldCheck,
} from 'lucide-react';

const PILLARS = [
  {
    icon: ClipboardList,
    title: 'Start with the work that matters',
    description:
      'Tell us what you manage, the service needs that recur, and the priorities your team cannot afford to lose sight of.',
  },
  {
    icon: Building2,
    title: 'Shape a route around your operation',
    description:
      'Discuss the right scope, request flow, approval points, and support model for your properties or sites.',
  },
  {
    icon: ShieldCheck,
    title: 'Make the next step clear',
    description:
      'Bring your questions, current process, and practical requirements to one business conversation before you commit.',
  },
];

const STEPS = [
  ['01', 'Share your context', 'Tell us about your organisation, locations, and the work you want to coordinate.'],
  ['02', 'Explore the fit', 'Talk through the priorities, service categories, and practical workflow your team needs.'],
  ['03', 'Choose the next step', 'Leave with a clear view of the right path for your operation.'],
];

function PillarCard({ icon: Icon, title, description }: (typeof PILLARS)[number]) {
  return (
    <article className="border border-slate-200 bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] sm:p-7">
      <span className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7F8EE] text-[#296A4B]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="font-display text-lg font-bold tracking-tight text-[#001A41]">{title}</h2>
      <p className="mt-2.5 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

function EnterprisePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FF] text-[#001A41]">
      <section className="relative isolate overflow-hidden bg-[#001A41] text-white">
        <Image
          src="/images/hero-skyline-1920.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001A41] via-[#001A41]/92 to-[#001A41]/45" />
        <div className="relative mx-auto max-w-[1280px] px-4 pb-16 pt-8 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <nav aria-label="Enterprise navigation" className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001A41]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              BukieBrainJobs
            </Link>
            <Link
              href="mailto:corporate@bukiebrainjobs.ng"
              className="motion-press inline-flex items-center gap-2 border border-white/30 bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001A41]"
            >
              Talk to us
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>

          <div className="grid items-end gap-12 pt-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:pt-24">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#ABEEC8]">
                <Building2 className="h-4 w-4" aria-hidden="true" />
                Bukie for business
              </p>
              <h1 className="font-display max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                A clearer way to plan the work that keeps your business moving.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                Bring your maintenance needs into one business conversation. We help you explore a service approach that respects the realities of your properties, teams, and day-to-day work.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="mailto:corporate@bukiebrainjobs.ng"
                  className="motion-press inline-flex items-center justify-center gap-2 bg-[#ABEEC8] px-6 py-3.5 text-sm font-bold text-[#001A41] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#001A41]"
                >
                  Start a business conversation
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#001A41]"
                >
                  Explore the marketplace
                </Link>
              </div>
            </div>

            <aside className="border border-white/15 bg-[#06152B]/90 p-6 shadow-2xl backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ABEEC8]">Start with a working brief</p>
              <div className="mt-6 space-y-5">
                <div className="border-b border-white/10 pb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your operation</p>
                  <p className="mt-1.5 text-sm font-semibold text-white">Properties, teams, and priorities</p>
                </div>
                <div className="border-b border-white/10 pb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your workflow</p>
                  <p className="mt-1.5 text-sm font-semibold text-white">Requests, approvals, and updates</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your next step</p>
                  <p className="mt-1.5 text-sm font-semibold text-white">A service path that fits the work</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24" aria-labelledby="enterprise-fit-heading">
        <div className="max-w-2xl">
          <p className="text-sm font-bold text-[#296A4B]">Built around the operation, not a generic package</p>
          <h2 id="enterprise-fit-heading" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#001A41] sm:text-4xl">
            Make maintenance easier to understand, discuss, and coordinate.
          </h2>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 md:grid-cols-3">
          {PILLARS.map((pillar) => <PillarCard key={pillar.title} {...pillar} />)}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white" aria-labelledby="enterprise-process-heading">
        <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-bold text-[#296A4B]">One clear starting point</p>
            <h2 id="enterprise-process-heading" className="mt-3 font-display text-3xl font-extrabold tracking-tight text-[#001A41] sm:text-4xl">
              A practical conversation before a bigger commitment.
            </h2>
          </div>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-12">
            {STEPS.map(([number, title, description]) => (
              <li key={number} className="border-t-2 border-[#001A41] pt-5">
                <p className="text-sm font-bold text-[#296A4B]">{number}</p>
                <h3 className="mt-3 font-display text-lg font-bold text-[#001A41]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-8 bg-[#001A41] p-8 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Tell us what your operation needs.</h2>
            <p className="mt-3 text-base leading-7 text-slate-200">
              Start with the properties or sites you manage and the work you want to make easier to coordinate.
            </p>
          </div>
          <Link
            href="mailto:corporate@bukiebrainjobs.ng"
            className="motion-press inline-flex shrink-0 items-center justify-center gap-2 bg-[#ABEEC8] px-6 py-3.5 text-sm font-bold text-[#001A41] transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#001A41]"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            corporate@bukiebrainjobs.ng
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <Image src="/images/wordmark-banner-tight.png" alt="BukieBrainJobs" width={150} height={45} sizes="150px" className="opacity-80" />
          <Link href="/" className="text-sm font-semibold text-[#001A41] underline-offset-4 hover:underline">
            Back to marketplace
          </Link>
        </div>
      </footer>
    </main>
  );
}

export default EnterprisePage;
