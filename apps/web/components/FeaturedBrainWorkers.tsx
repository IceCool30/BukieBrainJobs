'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, BadgeCheck, ArrowRight } from 'lucide-react';
import { MOCK_BRAINWORKERS, BrainWorker } from '../lib/mock/homepage-data';

interface FeaturedBrainWorkersProps {
  onSelectWorker?: ((worker: BrainWorker) => void) | undefined;
}

export default function FeaturedBrainWorkers({ onSelectWorker }: FeaturedBrainWorkersProps) {
  return (
    <section id="workers" className="py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Verified Professionals
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
              Featured Professionals
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              The same workers your neighbors in Lagos, Abuja, and Port Harcourt book again and again.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#296A4B] hover:text-[#1f5239] transition-colors"
          >
            View All Professionals
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Professional Cards (Mockup: photo-top card, green verified badge, name, trade, star rating, Verified pill) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_BRAINWORKERS.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] hover:border-[#296A4B]/50 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,26,65,0.18)] transition-all overflow-hidden flex flex-col group"
            >
              {/* Photo Header with Verified Badge */}
              <div className="relative h-44 bg-[#F1F5F9]">
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
              <div className="p-5 space-y-2 flex flex-col flex-grow">
                <h3 className="font-display font-bold text-base text-[#001A41] leading-tight">
                  {worker.name}
                </h3>
                <p className="text-sm text-slate-500">{worker.category}</p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0B1C30]">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{worker.rating.toFixed(1)}</span>
                  <span className="text-[13px] font-normal text-slate-500">({worker.reviewCount})</span>
                </div>
              </div>

              {/* Verified Pill + CTA */}
              <div className="px-5 pb-5 pt-1 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ABEEC8]/40 text-[#2E6E4F] text-xs font-bold border border-[#296A4B]/30">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
                <button
                  onClick={() => onSelectWorker?.(worker)}
                  className="text-xs font-semibold text-[#296A4B] hover:text-[#1f5239] underline-offset-4 hover:underline"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
