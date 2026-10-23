'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function BottomCTA() {
  return (
    <section className="py-14 sm:py-24 px-3 sm:px-6 lg:px-8 bg-[var(--bg)] transition-colors duration-200">
      <div className="max-w-[1280px] mx-auto rounded-[24px] sm:rounded-[36px] md:rounded-[48px] bg-gradient-to-br from-[#161B24] via-[#11161F] to-[#0B0E13] border border-white/10 p-8 sm:p-12 md:p-20 flex flex-col items-center text-center justify-center gap-6 sm:gap-8 shadow-2xl relative overflow-hidden">
        
        {/* Outlier Ambient Horizon Glow */}
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none opacity-20 blur-3xl rounded-full"
          style={{ background: 'radial-gradient(circle, #F7803C 0%, #2FE896 60%, transparent 100%)' }}
          aria-hidden="true"
        />

        {/* Telemetry Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-3.5 py-1.5 relative z-10 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F7803C]" />
          <span className="font-mono text-xs uppercase tracking-wider font-semibold text-slate-200">
            BukieGuarantee Protected
          </span>
        </div>

        {/* Outlier Headline */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-[-0.035em] leading-[1.1] max-w-2xl relative z-10">
          Ready for dependable, hassle-free artisan services?
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl relative z-10 leading-relaxed">
          Experience Nigeria&apos;s first fully escrow-backed trades platform. Post a job in two minutes or get instantly matched with a verified technician.
        </p>

        {/* Guarantees checklist */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300 font-medium relative z-10 pt-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2FE896]" />
            NIN/BVN Vetted
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2FE896]" />
            100% Escrow Milestone
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2FE896]" />
            24/7 Dispute Mediation
          </span>
        </div>

        {/* Dual Outlier Pill Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto relative z-10 pt-4">
          <Link
            href="/services"
            className="outlier-pill-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#F7803C] hover:bg-[#FF8D4D] text-[#0B0E13] font-bold text-sm shadow-xl transition-all"
          >
            <span>Book a BrainWorker Now</span>
            <ArrowRight className="w-4 h-4 text-[#0B0E13]" />
          </Link>
          <Link
            href="/brainworker/register"
            className="outlier-pill-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-white/20 hover:border-white/40 text-white font-semibold text-sm hover:bg-white/5 transition-all"
          >
            <span>Join as a BrainWorker</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
