import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, Scale, Headphones } from 'lucide-react';

const COVERAGE = [
  'Accidental property damage caused by the professional during an eligible booking',
  'Incomplete or abandoned work on eligible bookings',
  'Repairs needed to restore work that fails to meet the agreed scope',
];

const STEPS = [
  {
    n: '01',
    title: 'Report within 72 hours',
    desc: 'Open the booking in your account and raise a claim within 72 hours of the job completion. Attach photos or a short description of the issue.',
  },
  {
    n: '02',
    title: 'Nigerian support reviews',
    desc: 'Our Lagos-based team reviews the claim, the booking record, and both parties within two working days. No offshore call centers.',
  },
  {
    n: '03',
    title: 'Fair resolution',
    desc: 'Where the claim holds, the professional fixes the work at no cost to you, or the platform arranges a refund from escrow up to the coverage limit.',
  },
];

const EXCLUSIONS = [
  'Damage that existed before the booking or falls outside the agreed scope',
  'Professional fees above the quoted and approved amount',
  'Bookings arranged outside the platform to avoid escrow',
  'General wear and tear unrelated to the booked work',
];

export default function GuaranteePage() {
  return (
    <main className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <div className="bg-[#001A41] text-white border-b border-[#1E3A60]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#001A41]/95 to-[#001A41]/60" />
          <div className="relative z-10 space-y-4 max-w-3xl">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06152B] border border-[#1E3A60] text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              BukieGuarantee
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              Up to &#8358;500,000 in Protection on Eligible Bookings
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              The BukieGuarantee covers qualifying bookings against accidental property
              damage or incomplete work. Clear terms, a Nigerian support team, and refunds
              handled without the runaround.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* What is covered */}
        <section>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            What the BukieGuarantee covers
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] p-8 sm:p-10">
            <ul className="space-y-3">
              {COVERAGE.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Claim steps */}
        <section>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            How a claim works
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] p-7 space-y-3"
              >
                <div className="font-display font-extrabold text-2xl text-[#001A41]/80">{s.n}</div>
                <h2 className="font-display font-bold text-base text-[#0B1C30]">{s.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Exclusions */}
        <section>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            What is not covered
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] p-8 sm:p-10">
            <ul className="space-y-3">
              {EXCLUSIONS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                  <AlertTriangle className="w-4.5 h-4.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Escrow context */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6 text-slate-600" />
          </div>
          <div className="space-y-1.5 flex-grow">
            <h2 className="font-display font-bold text-lg text-[#0B1C30]">
              Escrow works alongside the guarantee
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              Your payment never goes to the professional until you approve the work. The
              BukieGuarantee steps in after that, if something still goes wrong.
            </p>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h2 className="font-display font-bold text-xl text-[#0B1C30]">
              Questions about the guarantee?
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Our support team answers coverage questions directly, in plain English.
            </p>
          </div>
          <div className="space-y-3 shrink-0">
            <a
              href="mailto:support@bukiebrainjobs.ng"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#001A41] hover:bg-[#000F2D] text-white text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <Headphones className="w-4 h-4" />
              Contact support
            </a>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-300 text-[#0B1C30] text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 hover:border-slate-400"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <Image
            src="/images/wordmark-banner-tight.png?v=3"
            alt="BukieBrainJobs"
            width={150}
            height={44}
            priority={false}
            className="opacity-70"
          />
        </div>
      </div>
    </main>
  );
}
