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
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Get Started
          </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
            Choose Your Path
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pathway A: Post a Job */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF7EF] border border-[#ABEEC8]/70 text-xs font-semibold text-[#296A4B]">
                <Briefcase className="w-3.5 h-3.5" />
                <span>For your project needs</span>
              </div>

              <h3 className="font-display font-bold text-2xl text-[#001A41]">
                Post a job request
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Describe your job requirements, location, and budget. Verified professionals in your area will review it and submit competitive quotes.
              </p>

              <ul className="space-y-2 text-xs text-slate-500 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B]" />
                  <span>Receive up to 5 verified quotes, typically within hours</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B]" />
                  <span>No upfront payment required; all funds secured in escrow</span>
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

          {/* Pathway B: Join as Professional */}
          <div className="bg-slate-50 text-slate-900 rounded-xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600">
                <UserCheck className="w-3.5 h-3.5" />
                <span>For skilled professionals</span>
              </div>

              <h3 className="font-display font-bold text-2xl text-[#0B1C30]">
                Join our professional network
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Join Nigeria's leading professional network. Set your rates, build your reputation, and receive direct bank payments upon job completion and client approval.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Comprehensive NIN and BVN verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Direct bank payouts for each completed job</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={onBecomeWorkerClick}
                className="w-full sm:w-auto px-6 py-3 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Apply to Join</span>
                <ArrowRight className="w-4 h-4 text-[#ABEEC8]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
