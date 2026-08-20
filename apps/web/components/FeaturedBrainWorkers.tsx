'use client';

import React from 'react';
import Image from 'next/image';
import { BadgeCheck } from 'lucide-react';
import { MOCK_BRAINWORKERS, BrainWorker } from '../lib/mock/homepage-data';

interface FeaturedBrainWorkersProps {
  onSelectWorker?: ((worker: BrainWorker) => void) | undefined;
}

export default function FeaturedBrainWorkers({ onSelectWorker }: FeaturedBrainWorkersProps) {
  return (
    <section id="workers" className="py-12 sm:py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
            Meet BrainWorkers
          </h2>
        </div>

        {/* Professional Cards (Mockup: photo-top card, green verified badge, name, trade, star rating, Verified pill) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {MOCK_BRAINWORKERS.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] hover:border-[#296A4B]/50 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,26,65,0.18)] transition-all overflow-hidden flex flex-col group"
            >
              {/* Photo Header with Verified Badge */}
              <div className="relative h-40 sm:h-44 bg-[#F1F5F9]">
                <Image
                  src={worker.avatarUrl}
                  alt={worker.name}
                  fill
                  sizes="320px"
                  className="object-cover object-center"
                />
                <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#296A4B] flex items-center justify-center shadow-sm">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </span>
              </div>

              {/* Name, Trade, Rating */}
              <div className="p-4 sm:p-5 space-y-2 flex flex-col flex-grow">
                <h3 className="font-display font-bold text-base text-[#001A41] leading-tight">
                  {worker.name}
                </h3>
                <p className="text-sm text-slate-500">{worker.category}</p>
              </div>

              <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
                <button
                  onClick={() => onSelectWorker?.(worker)}
                  className="text-xs font-semibold text-[#296A4B] hover:text-[#1f5239] underline-offset-4 hover:underline"
                >
                  View profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
