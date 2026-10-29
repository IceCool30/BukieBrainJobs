import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | BukieBrainJobs',
  description: 'How BukieBrainJobs protects your personal information, booking details, and identity documents.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] pt-[var(--header-height)] transition-colors duration-200">
        {/* Header Hero */}
        <section className="bg-[var(--strip-bg)] text-white py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--strip-text)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] rounded-full px-3 py-1.5"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--amber)]" aria-hidden="true" />
              Back to home
            </Link>
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-green)]" />
              Data Protection & Privacy
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Privacy Policy
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--strip-text)] sm:text-base">
              We protect your personal information, contact records, and verification details. Here is exactly what we collect, how we use it, and what stays private.
            </p>
          </div>
        </section>

        {/* Content Body */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-10 text-sm leading-relaxed text-[var(--text-muted)]">
            <div className="rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-[var(--text-main)] font-display font-bold text-lg">
                <Lock className="h-5 w-5 text-[var(--brand-green)] shrink-0" />
                <h2>1. Information We Collect</h2>
              </div>
              <p>
                When you create an account, post a job request, or sign up as a BrainWorker on BukieBrainJobs, we collect:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--text-main)]">
                <li>Your name, primary telephone number, and email address.</li>
                <li>Service addresses and location landmarks necessary to dispatch local BrainWorkers.</li>
                <li>Job problem descriptions, photos, and scheduling requirements.</li>
                <li>For BrainWorkers: government identity documents (NIN or BVN) used strictly to verify your trade credentials and identity.</li>
                <li>Payment transaction references for work completed and held in escrow.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-[var(--text-main)] font-display font-bold text-lg">
                <Eye className="h-5 w-5 text-[var(--brand-green)] shrink-0" />
                <h2>2. How We Use and Share Information</h2>
              </div>
              <p>
                We do not sell, rent, or trade your personal information. Information is shared only as necessary to fulfill marketplace bookings:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--text-main)]">
                <li>Assigned BrainWorkers receive the customer job address and contact details only after a booking is confirmed.</li>
                <li>Verification documents such as NIN and BVN are used exclusively to confirm identity and are never displayed on public profiles.</li>
                <li>Transaction and settlement details are communicated securely with licensed payment gateway partners in Nigeria.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 text-[var(--text-main)] font-display font-bold text-lg">
                <FileText className="h-5 w-5 text-[var(--brand-green)] shrink-0" />
                <h2>3. Data Retention and Customer Rights</h2>
              </div>
              <p>
                You retain control over your data. Through your Profile and Settings workspace, you can view your personal details, update notification preferences, and request an export or complete deletion of your account record.
              </p>
              <p>
                If you have questions about our privacy practices or wish to submit a data request, contact our support desk directly at <a href="mailto:support@bukiebrainjobs.ng" className="text-[var(--brand-green)] hover:underline font-semibold">support@bukiebrainjobs.ng</a>.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
