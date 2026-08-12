import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, UserCheck, Headphones, ArrowRight } from 'lucide-react';

export default function TrustSafetySection() {
  const trustPillars = [
    {
      title: 'Comprehensive Biometric Verification',
      desc: 'Every professional undergoes rigorous identity verification, including NIN validation, BVN confirmation, and physical address verification.',
      icon: <UserCheck className="w-5 h-5 text-[#296A4B]" />,
    },
    {
      title: 'Fully Secured Payments',
      desc: 'All payments are processed through secure gateways into a protected escrow account. Funds are released only after you approve the work.',
      icon: <Lock className="w-5 h-5 text-[#296A4B]" />,
    },
    {
      title: 'BukieGuarantee Protection',
      desc: 'Eligible bookings include platform protection up to N500,000, covering accidental property damage or incomplete work.',
      icon: <ShieldCheck className="w-5 h-5 text-[#296A4B]" />,
    },
    {
      title: 'Fair Dispute Resolution',
      desc: 'Our Nigerian support team mediates any disagreements according to clear terms, ensuring fair resolutions and timely refunds when necessary.',
      icon: <Headphones className="w-5 h-5 text-[#296A4B]" />,
    },
  ];

  return (
    <section id="trust" className="py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF7EF] border border-[#ABEEC8]/70 text-xs font-semibold text-[#296A4B]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Our Security Standards</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
            Built on Trust and Security
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            When you invite a professional into your home or office, trust is essential. We verify every professional and protect every payment.
          </p>
        </div>

        <div className="relative rounded-xl border border-[#ABEEC8]/70 bg-white p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)]">
          <div className="shrink-0">
            <div className="w-14 h-14 rounded-xl bg-[#296A4B] border border-[#ABEEC8]/40 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#ABEEC8]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-[#001A41]">
              The BukieGuarantee: up to &#8358;500,000 in coverage
            </h3>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
              Every eligible booking carries platform protection of up to &#8358;500,000 against
              accidental property damage or incomplete work. Clear terms, a Nigerian support
              team, and refunds handled without the runaround.
            </p>
            <Link href="/guarantee" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#296A4B] hover:underline pt-1">
              Read the full BukieGuarantee terms
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustPillars.slice(0, 2).concat(trustPillars.slice(3, 4)).map((p, idx) => (
            <div key={idx} className="space-y-4 bg-white rounded-xl border border-slate-200 p-6 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)]">
              <div className="w-10 h-10 rounded-lg bg-[#EAF7EF] border border-[#ABEEC8]/70 flex items-center justify-center">
                {p.icon}
              </div>
              <h3 className="font-display font-bold text-base text-[#001A41]">
                {p.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
