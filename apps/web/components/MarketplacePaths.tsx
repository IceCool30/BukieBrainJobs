'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface MarketplacePathsProps {
  onPostJobClick?: (() => void) | undefined;
  onBecomeWorkerClick?: (() => void) | undefined;
}

export default function MarketplacePaths({ onPostJobClick, onBecomeWorkerClick }: MarketplacePathsProps) {
  return (
    <section className="py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
            Choose your path
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pathway A: Post a Job */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-3 relative z-10">
              <h3 className="font-display font-bold text-2xl text-[#001A41]">
                Post a job
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Share the work, location, and budget to receive relevant responses.
              </p>
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

          {/* Pathway B: Become a BrainWorker */}
          <div className="bg-slate-50 text-slate-900 rounded-xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-3 relative z-10">
              <h3 className="font-display font-bold text-2xl text-[#001A41]">
                Offer your skills
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Create your BrainWorker profile and respond to work that fits your skills.
              </p>
            </div>

            <div className="pt-2 relative z-10">
              <button
                onClick={onBecomeWorkerClick}
                className="motion-press w-full sm:w-auto px-6 py-3 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold rounded-full transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>Become a BrainWorker</span>
                <ArrowRight className="w-4 h-4 text-[#ABEEC8]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
