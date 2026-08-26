import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

const BOOKING_STEPS = [
  {
    title: 'Review the service and profile',
    description: 'Look through the service, starting price, and profile information before you move to the booking review.',
    icon: UserCheck,
  },
  {
    title: 'Prepare the details that matter',
    description: 'Keep the scope, location, timing, and budget details ready for the next step.',
    icon: Lock,
  },
  {
    title: 'Keep a clear record',
    description: 'Keep the details you have reviewed together, then contact support if you need help.',
    icon: FileText,
  },
];

const BOOKING_CHECKS = [
  'Service details that fit the job you need done',
  'Starting price and budget details to consider',
  'The profile information shown for a BrainWorker',
];

export default function GuaranteePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FF] text-[#001A41]">
      <section className="bg-[#001A41] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 pb-9 pt-20 sm:gap-8 sm:px-6 sm:pb-12 sm:pt-24 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8 lg:pb-14">
          <div className="max-w-2xl space-y-4 sm:space-y-5">
            <div>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2 focus:ring-offset-[#001A41]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#ABEEC8]">
              <ShieldCheck className="h-4 w-4" />
              BukieGuarantee
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Review the details before you move ahead.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
                Review the service, BrainWorker profile, and support options before you continue.
              </p>
            </div>
            <div>
              <Link
                href="/services"
                className="motion-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ABEEC8] px-5 py-3 text-sm font-bold text-[#001A41] transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#001A41]"
              >
                Find a service
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside className="self-end rounded-xl border border-white/15 bg-white/5 p-5 shadow-[0_16px_32px_-24px_rgba(0,0,0,0.8)] sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ABEEC8]">Before you book</p>
            <ul className="mt-3.5 space-y-3">
              {BOOKING_CHECKS.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-100">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ABEEC8]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">What to review</p>
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">A simple way to prepare for the next step.</h2>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            BukieGuarantee brings the service and profile details together, so you can decide what to do next with a clearer picture.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
          {BOOKING_STEPS.map(({ title, description, icon: Icon }, index) => (
            <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_8px_20px_-18px_rgba(0,26,65,0.28)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ABEEC8]/70 bg-[#EAF7EF] text-[#296A4B]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-display text-xl font-extrabold text-[#001A41]/20">0{index + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-base font-bold tracking-tight sm:text-lg">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-9 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] lg:items-center lg:px-8 lg:py-12">
          <div className="max-w-2xl space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ABEEC8]/70 bg-[#EAF7EF] text-[#296A4B]">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">Take a moment to review.</h2>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Check the scope, starting price, location, and timing before you move to the next step.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-[#F8F9FF] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">A clearer view</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Use the booking preparation pages to keep the job details you have reviewed close at hand.
            </p>
          </div>
        </div>
      </section>

      <section id="verification" className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_8px_20px_-18px_rgba(0,26,65,0.28)] sm:p-7">
          <div className="max-w-2xl space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ABEEC8]/70 bg-[#EAF7EF] text-[#296A4B]">
              <UserCheck className="h-5 w-5" />
            </div>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">Look through the profile details.</h2>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              Check the service information shown on a BrainWorker profile alongside the job details before you continue.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-slate-600">Questions about the details you are reviewing? Contact support with what you already have.</p>
          <a
            href="mailto:support@bukiebrainjobs.ng"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#296A4B] transition-colors hover:text-[#001A41] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2"
          >
            Contact support
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </footer>
    </main>
  );
}
