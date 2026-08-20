import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Headphones,
  Lock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

const BOOKING_STEPS = [
  {
    title: 'Review the service and profile',
    description: 'Check the service details, starting price, and BrainWorker profile before you choose a time.',
    icon: UserCheck,
  },
  {
    title: 'Keep payment connected to the work',
    description: 'For eligible bookings, payment is held in Escrow while you review the completed job.',
    icon: Lock,
  },
  {
    title: 'Use the booking record if you need help',
    description: 'Keep the agreed details together and use the support option when something needs attention.',
    icon: FileText,
  },
];

const BOOKING_CHECKS = [
  'Service details that match the job you need done',
  'Price information before you select a payment method',
  'A BrainWorker profile and verification status to review',
];

export default function GuaranteePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FF] text-[#001A41]">
      <section className="bg-[#001A41] text-white">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 pb-14 pt-32 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:pb-20">
          <div className="max-w-2xl space-y-6">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-200 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2 focus:ring-offset-[#001A41]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ABEEC8]/25 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#ABEEC8]">
              <ShieldCheck className="h-3.5 w-3.5" />
              BukieGuarantee
            </div>
            <div className="space-y-4">
              <h1 className="max-w-xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                Book with clearer information.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
                Review the service, BrainWorker profile, payment details, and support options before you book.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services"
                className="motion-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#ABEEC8] px-5 py-3 text-sm font-bold text-[#001A41] transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#001A41]"
              >
                Find a service
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:support@bukiebrainjobs.ng"
                className="motion-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-white/50 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2 focus:ring-offset-[#001A41]"
              >
                <Headphones className="h-4 w-4" />
                Contact support
              </a>
            </div>
          </div>

          <aside className="self-end rounded-2xl border border-white/15 bg-white/5 p-6 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.8)]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ABEEC8]">Before you book</p>
            <ul className="mt-5 space-y-4">
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

      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">The booking journey</p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Know what comes next at every step.</h2>
          <p className="text-base leading-relaxed text-slate-600">
            BukieGuarantee brings the details that matter into one place, so you can make a more informed booking decision.
          </p>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3 md:gap-6">
          {BOOKING_STEPS.map(({ title, description, icon: Icon }, index) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_-18px_rgba(0,26,65,0.28)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ABEEC8]/70 bg-[#EAF7EF] text-[#296A4B]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-display text-2xl font-extrabold text-[#001A41]/20">0{index + 1}</span>
              </div>
              <h3 className="mt-7 font-display text-lg font-bold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] lg:items-center lg:px-8 lg:py-16">
          <div className="max-w-2xl space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ABEEC8]/70 bg-[#EAF7EF] text-[#296A4B]">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Escrow stays close to the booking decision.</h2>
            <p className="text-base leading-relaxed text-slate-600">
              Escrow protection appears in the payment step. You see the amount held in Escrow before you select a payment method.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-[#F8F9FF] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">Payment context</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Your payment is held while you review the completed job. Keep the booking record available if you need support.
            </p>
          </div>
        </div>
      </section>

      <section id="verification" className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_8px_24px_-18px_rgba(0,26,65,0.28)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="max-w-2xl space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#ABEEC8]/70 bg-[#EAF7EF] text-[#296A4B]">
                <UserCheck className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Review a profile before you decide.</h2>
              <p className="text-base leading-relaxed text-slate-600">
                Check a BrainWorker’s profile and verification status alongside the service details before you book.
              </p>
            </div>
            <Link
              href="/services"
              className="motion-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#001A41] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2"
            >
              Browse services
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-6 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-slate-600">Questions about a booking? Contact support with the details you already have.</p>
          <a
            href="mailto:support@bukiebrainjobs.ng"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#296A4B] transition-colors hover:text-[#001A41] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2"
          >
            Contact support
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="border-t border-slate-100 py-6 text-center">
          <Image
            src="/images/wordmark-banner-tight.png?v=3"
            alt="BukieBrainJobs"
            width={150}
            height={44}
            className="mx-auto opacity-70"
          />
        </div>
      </footer>
    </main>
  );
}
