'use client';

import React from 'react';
import { Briefcase, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface MarketplacePathsProps {
  onPostJobClick?: () => void;
  onBecomeWorkerClick?: () => void;
}

export default function MarketplacePaths({ onPostJobClick, onBecomeWorkerClick }: MarketplacePathsProps) {
  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="text-xs font-bold text-[#296A4B] uppercase tracking-wider">
            Alternative Entry Paths
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0B1C30]">
            Explore More Ways to Use the Platform
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pathway A: Post a Job */}
          <div className="bg-[#001A41] text-white rounded-3xl p-8 border border-[#1E3A60] shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#296A4B]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06152B] border border-[#296A4B]/40 text-xs font-semibold text-[#ABEEC8]">
                <Briefcase className="w-3.5 h-3.5" />
                <span>For Custom Projects &amp; Heavy Tasks</span>
              </div>

              <h3 className="font-display font-bold text-2xl text-white">
                Have a specific task? Post a job and get matched quotes.
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Describe your exact job requirements, location, and preferred budget. Vetted local artisans in your city will review your request and submit competing transparent quotes.
              </p>

              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ABEEC8]" />
                  <span>Receive up to 5 verified artisan quotes within hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ABEEC8]" />
                  <span>100% Escrow protected—no funds paid upfront</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={onPostJobClick}
                className="w-full sm:w-auto px-6 py-3 bg-[#296A4B] hover:bg-[#1F523A] text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Post a Job Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pathway B: Become a BrainWorker */}
          <div className="bg-[#EFF4FF] text-slate-900 rounded-3xl p-8 border border-[#CBDBF5] shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#296A4B]/40 text-xs font-semibold text-[#2E6E4F]">
                <UserCheck className="w-3.5 h-3.5" />
                <span>For Qualified Nigerian Artisans</span>
              </div>

              <h3 className="font-display font-bold text-2xl text-[#0B1C30]">
                Are you a skilled professional? Become a BrainWorker.
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Join Nigeria&apos;s most trusted professional network. Build your BukiePassport reputation, set your own rates, and get consistent client requests with guaranteed payouts.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B]" />
                  <span>NIN &amp; BVN Biometric BukiePassport Verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B]" />
                  <span>Direct Bank Payouts on job completion</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={onBecomeWorkerClick}
                className="w-full sm:w-auto px-6 py-3 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Apply as a BrainWorker</span>
                <ArrowRight className="w-4 h-4 text-[#ABEEC8]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
