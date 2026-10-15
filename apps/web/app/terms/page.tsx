import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service | BukieBrainJobs',
  description: 'Terms governing booking, service delivery, escrow payments, and marketplace conduct on BukieBrainJobs.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] pt-[var(--header-height)] transition-colors duration-200">
        {/* Header Hero */}
        <section className="bg-[var(--strip-bg)] text-white py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[var(--strip-text)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] rounded-lg"
            >
              <ArrowLeft className="h-4 w-4 text-[var(--amber)]" aria-hidden="true" />
              Back to home
            </Link>
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-green)]">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-green)]" />
              Marketplace Rules & Conditions
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Terms of Service
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--strip-text)] sm:text-base">
              These terms govern your use of the BukieBrainJobs platform, service bookings, escrow protection, and marketplace standards.
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-10 text-sm leading-relaxed text-[var(--text-muted)]">
            <div className="rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-[var(--text-main)] font-display font-bold text-lg">
                1. Marketplace Platform Agreement
              </h2>
              <p>
                BukieBrainJobs operates an online marketplace connecting customers seeking trade and technical services with verified independent BrainWorkers in Nigeria. By accessing or using the platform, you agree to comply with these terms.
              </p>
              <p>
                BukieBrainJobs Platform Limited provides verification, booking coordination, and escrow milestone release mechanisms, while independent BrainWorkers perform the contracted trades.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-[var(--text-main)] font-display font-bold text-lg">
                2. Escrow Protection and Milestone Releases
              </h2>
              <p>
                To safeguard both parties, customer payments are held in secure escrow upon booking confirmation. Funds are not disbursed to a BrainWorker until:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--text-main)]">
                <li>The BrainWorker completes the agreed job scope at the customer premises.</li>
                <li>The customer inspects the completed work and confirms satisfaction.</li>
                <li>In case of a formal dispute, funds remain in escrow pending resolution under the BukieGuarantee guidelines.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-[var(--text-main)] font-display font-bold text-lg">
                3. Customer and BrainWorker Responsibilities
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-[var(--text-main)]">
                <li><strong>Accurate Descriptions:</strong> Customers must supply accurate problem descriptions, physical addresses, and access instructions.</li>
                <li><strong>Safe Work Environment:</strong> Customers must provide safe access to the work location.</li>
                <li><strong>Identity and Competence:</strong> BrainWorkers must maintain valid verification credentials and deliver work meeting professional trade standards.</li>
                <li><strong>Direct Off-Platform Payments:</strong> Off-platform cash transactions void escrow protection and the BukieGuarantee.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-[var(--text-main)] font-display font-bold text-lg">
                4. Inquiries & Support
              </h2>
              <p>
                For questions regarding these terms, contact our support team at <a href="mailto:support@bukiebrainjobs.ng" className="text-[var(--brand-green)] hover:underline font-semibold">support@bukiebrainjobs.ng</a> or call +234 800-BUKIE-JOBS.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
