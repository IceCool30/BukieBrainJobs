import React from 'react';
import { ShieldCheck, Lock, UserCheck, Headphones } from 'lucide-react';

export default function TrustSafetySection() {
  const trustPillars = [
    {
      title: 'BukiePassport Biometric Vetting',
      desc: 'BrainWorkers undergo multi-level background checks including NIN biometric validation, BVN identity match, and physical address audits.',
      icon: <UserCheck className="w-5 h-5 text-[#ABEEC8]" />,
    },
    {
      title: '100% Escrow Payment Protection',
      desc: 'Funds are held securely via dual Paystack and Flutterwave rails. Money is never released until you inspect and approve the job.',
      icon: <Lock className="w-5 h-5 text-[#ABEEC8]" />,
    },
    {
      title: 'BukieGuarantee Property Shield',
      desc: 'Qualifying bookings carry up to ₦500,000 platform guarantee coverage against accidental property damage or incomplete work.',
      icon: <ShieldCheck className="w-5 h-5 text-[#ABEEC8]" />,
    },
    {
      title: 'Fair Dispute Resolution & Support',
      desc: 'Dedicated Nigerian customer support managers mediate any service discrepancies with clear platform terms and quick refunds.',
      icon: <Headphones className="w-5 h-5 text-[#ABEEC8]" />,
    },
  ];

  return (
    <section id="trust" className="py-16 bg-[#001A41] text-white border-b border-[#1E3A60]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06152B] border border-[#296A4B]/50 text-xs font-semibold text-[#ABEEC8]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#296A4B]" />
            <span>Platform Security Standards</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Built on Uncompromising Trust &amp; Verification
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            We are solving the fundamental trust crisis in local Nigerian services through biometric verification and financial escrow.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPillars.map((p, idx) => (
            <div
              key={idx}
              className="bg-[#06152B] p-6 rounded-2xl border border-[#1E3A60] space-y-4 hover:border-[#296A4B]/60 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#001A41] border border-[#1E3A60] flex items-center justify-center shadow-sm">
                {p.icon}
              </div>
              <h3 className="font-display font-bold text-base text-white">
                {p.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
