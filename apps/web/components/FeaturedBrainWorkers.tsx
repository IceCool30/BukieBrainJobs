'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, MapPin, Star, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPublicBrainWorkers, PublicBrainWorker } from '../lib/mock/homepage-data';

interface FeaturedBrainWorkersProps {
  profileCity?: string;
}

const featuredWorkers = getPublicBrainWorkers();

function WorkerCard({ worker, profileCity }: { worker: PublicBrainWorker; profileCity?: string }) {
  const href = profileCity
    ? `/brainworkers/${worker.id}?city=${encodeURIComponent(profileCity)}`
    : `/brainworkers/${worker.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col justify-between overflow-hidden rounded-[20px] md:rounded-[24px] border border-[var(--lead)] bg-[var(--card-bg)] text-[var(--text-main)] hover:bg-[var(--card-hover)] hover:border-[#F7803C]/50 text-left transition-all duration-200 hover:shadow-xl hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 shrink-0 w-[260px] sm:w-auto snap-start"
      aria-label={`View ${worker.name}'s profile`}
    >
      <div>
        <div className="relative aspect-[5/4] overflow-hidden bg-[var(--tag-bg)]">
          <Image
            src={worker.avatarUrl}
            alt={`Portrait of ${worker.name}`}
            fill
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Outlier Verified Pill Badge */}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#2FE896]/30 bg-black/60 backdrop-blur-md px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#2FE896] shadow-xs">
            <BadgeCheck className="h-3.5 w-3.5 text-[#2FE896]" aria-hidden="true" />
            Verified Pro
          </span>

          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#F7803C] text-[#0B0E13] opacity-0 group-hover:opacity-100 shadow-md transition-all duration-200 group-hover:translate-x-0 translate-x-1" aria-hidden="true">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold leading-snug text-[var(--text-main)] transition-colors group-hover:text-[#F7803C] truncate">
              {worker.name}
            </h3>
            <span className="flex items-center gap-1 font-mono text-xs font-bold text-[#F7803C]">
              <Star className="w-3 h-3 fill-current" />
              5.0
            </span>
          </div>

          <p className="line-clamp-1 text-xs text-[var(--text-muted)] font-medium">
            {worker.title}
          </p>

          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] pt-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{worker.location}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--lead)] px-4 py-3 text-xs bg-[var(--tag-bg)]/40">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2FE896] animate-pulse" aria-hidden="true" />
          Available today
        </span>
        <span className="shrink-0 font-mono text-xs font-extrabold text-[var(--text-main)]">
          From {worker.startingRate}
        </span>
      </div>
    </Link>
  );
}

export default function FeaturedBrainWorkers({ profileCity }: FeaturedBrainWorkersProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <section id="workers" className="border-b border-[var(--lead)] bg-[var(--bg)] text-[var(--text-main)] py-14 sm:py-20 transition-colors duration-200">
      <div className="mx-auto max-w-[1280px] space-y-8 px-4 sm:space-y-10 sm:px-6 lg:px-8">
        
        {/* Header with Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--lead)] bg-[var(--tag-bg)] px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2FE896]" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)]">
                Vetted Nigerian Artisans
              </span>
            </div>
            <h2 className="font-display tracking-tight text-2xl sm:text-4xl font-extrabold text-[var(--text-main)]">
              Meet the featured BrainWorkers
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-xl">
              Strictly vetted through NIN/BVN biometric screening and practical workshop trade tests.
            </p>
          </div>

          {/* Carousel Arrows on Mobile/Desktop */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Previous artisans"
              className="outlier-pill-button w-10 h-10 rounded-full border border-[var(--lead)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] flex items-center justify-center text-[var(--text-main)] transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Next artisans"
              className="outlier-pill-button w-10 h-10 rounded-full border border-[var(--lead)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] flex items-center justify-center text-[var(--text-main)] transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Outlier Touch Scroll-Snap Carousel */}
        <div 
          ref={carouselRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-visible"
        >
          {featuredWorkers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} {...(profileCity ? { profileCity } : {})} />
          ))}
        </div>

      </div>
    </section>
  );
}
