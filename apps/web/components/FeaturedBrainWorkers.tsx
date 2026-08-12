'use client';

import React from 'react';
import Image from 'next/image';
import { Star, ShieldCheck, MapPin } from 'lucide-react';
import { MOCK_BRAINWORKERS, BrainWorker } from '../lib/mock/homepage-data';

interface FeaturedBrainWorkersProps {
  onSelectWorker?: (worker: BrainWorker) => void;
}

export default function FeaturedBrainWorkers({ onSelectWorker }: FeaturedBrainWorkersProps) {
  return (
    <section className="py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#296A4B] uppercase tracking-wider mb-1">
              BukiePassport Tier 2 Vetted
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0B1C30]">
              Featured Top-Rated BrainWorkers
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            Every BrainWorker undergoes NIN/BVN biometric check, residential address audit, and technical trade vetting before taking client bookings.
          </p>
        </div>

        {/* 4 Professional Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_BRAINWORKERS.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#296A4B]/40 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5 space-y-4">
                {/* Top Profile Header */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden relative border-2 border-[#296A4B]/40 shrink-0">
                    <Image
                      src={worker.avatarUrl}
                      alt={worker.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-[#0B1C30] line-clamp-1">
                      {worker.name}
                    </h3>
                    <div className="text-[11px] font-medium text-[#296A4B]">
                      {worker.title}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="line-clamp-1">{worker.location}</span>
                    </div>
                  </div>
                </div>

                {/* Rating & Verification Badges */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1 font-bold text-[#0B1C30]">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{worker.rating}</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      ({worker.reviewCount})
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ABEEC8]/30 text-[#2E6E4F] text-[10px] font-bold border border-[#296A4B]/30">
                    <ShieldCheck className="w-3 h-3" />
                    {worker.passportTier}
                  </span>
                </div>

                {/* Skills Chips */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Top Skills:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {worker.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Price & Level 3 CTA */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Starting Rate</div>
                  <div className="text-xs font-bold text-[#001A41]">{worker.startingRate} / job</div>
                </div>

                <button
                  onClick={() => onSelectWorker?.(worker)}
                  className="px-3.5 py-1.5 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-semibold rounded-full transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
