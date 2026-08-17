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
            Two ways to use BukieBrainJobs
          </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
            Book work or find work
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pathway A: Post a Job */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF7EF] border border-[#ABEEC8]/70 text-xs font-semibold text-[#296A4B]">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Need a professional?</span>
              </div>

              <h3 className="font-display font-bold text-2xl text-[#001A41]">
                Post a job request
              </h3>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Describe the work, your location, and your budget. Professionals can review the request and send quotes for you to consider.
              </p>

              <ul className="space-y-2 text-xs text-slate-500 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B]" />
                  <span>Compare responses and choose the professional who fits the job</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B]" />
                  <span>Use Escrow for eligible bookings after you agree the details</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={onPostJobClick}
                className="motion-press w-full sm:w-auto px-6 py-3 bg-[#296A4B] hover:bg-[#1F523A] text-white text-xs font-bold rounded-full transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>Post a job</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Pathway B: Join as Professional */}
          <div className="bg-slate-50 text-slate-900 rounded-xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Offer your skills</span>
              </div>

              <h3 className="font-display font-bold text-2xl text-[#0B1C30]">
                Find work that fits your skills
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Create a professional profile, set clear service details, and respond to jobs that suit your skills and availability.
              </p>

              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Complete the required verification steps for your profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Keep your booking details and payment history in one place</span>
                </li>
              </ul>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={onBecomeWorkerClick}
                className="motion-press w-full sm:w-auto px-6 py-3 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold rounded-full transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>Create a professional profile</span>
                <ArrowRight className="w-4 h-4 text-[#ABEEC8]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
