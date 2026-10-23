'use client';

import React from 'react';
import Image from 'next/image';
import { BadgeCheck, Star, ShieldCheck, MapPin } from 'lucide-react';

interface PartnerBarProps {
  compact?: boolean;
}

const TICKER_ARTISANS = [
  {
    name: 'Babatunde Adeleke',
    trade: 'Master Generator Specialist',
    location: 'Ikeja, Lagos',
    rating: '5.0',
    jobs: '218 jobs',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    accentColor: '#F7803C',
  },
  {
    name: 'Chioma Nwachukwu',
    trade: 'HVAC & Chiller Engineer',
    location: 'Victoria Island, Lagos',
    rating: '4.98',
    jobs: '164 jobs',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    accentColor: '#2FE896',
  },
  {
    name: 'Emeka Obi',
    trade: 'Solar Inverter Lead Tech',
    location: 'Lekki Phase 1, Lagos',
    rating: '4.95',
    jobs: '192 jobs',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    accentColor: '#F7803C',
  },
  {
    name: 'Yusuf Ibrahim',
    trade: 'Commercial Electrician',
    location: 'Maitama, Abuja',
    rating: '4.92',
    jobs: '135 jobs',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    accentColor: '#2FE896',
  },
  {
    name: 'David Okon',
    trade: 'Precision Pipe & Tank Tech',
    location: 'GRA Phase 2, Port Harcourt',
    rating: '4.97',
    jobs: '110 jobs',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    accentColor: '#F7803C',
  },
  {
    name: 'Folake Balogun',
    trade: 'Architectural Finish & Paint',
    location: 'Ikoyi, Lagos',
    rating: '5.0',
    jobs: '87 jobs',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    accentColor: '#2FE896',
  },
];

const TICKER_METRICS = [
  { value: '99.4%', label: 'On-Time Arrival', sub: 'GPS-tracked dispatch' },
  { value: '₦24.8M', label: 'Escrow Secured', sub: 'Zero contractor risk' },
  { value: '4,200+', label: 'Vetted Artisans', sub: 'NIN & BVN verified' },
  { value: '15 Mins', label: 'Average Match Time', sub: 'Instant booking SLA' },
];

export default function PartnerBar({ compact = false }: PartnerBarProps) {
  return (
    <section 
      aria-label="Live Verified BrainWorkers Telemetry and Partners"
      className="w-full overflow-hidden border-y border-[var(--lead)] bg-[var(--card-bg)] py-4 select-none relative transition-colors duration-200"
    >
      {/* Edge Gradient Masking (Left & Right Outlier fades) */}
      <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 md:w-36 bg-gradient-to-r from-[var(--card-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 md:w-36 bg-gradient-to-l from-[var(--card-bg)] to-transparent z-10 pointer-events-none" />

      {/* Header bar / Trust indicators */}
      <div className="max-w-[1280px] mx-auto px-4 mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span className="telemetry-beacon inline-block" />
          <span className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[var(--text-main)]">
            Live Verified Artisan Telemetry
          </span>
          <span className="hidden sm:inline text-[var(--text-muted)]">• Active Dispatch in Lagos, Abuja & PH</span>
        </div>

        {/* Payment & Security Partners */}
        <div className="flex items-center gap-6">
          <span className="text-[11px] font-medium hidden md:inline">Identity & Escrow Partners:</span>
          <div className="flex items-center gap-4 sm:gap-6">
            <Image
              src="/images/partners/paystack-official.svg"
              alt="Paystack"
              width={100}
              height={20}
              className="h-3.5 sm:h-4 w-auto partner-logo opacity-70 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/images/partners/flutterwave-official.svg"
              alt="Flutterwave"
              width={110}
              height={20}
              className="h-3.5 sm:h-4 w-auto partner-logo opacity-70 hover:opacity-100 transition-opacity"
            />
            <Image
              src="/images/partners/dojah-official.svg"
              alt="Dojah"
              width={55}
              height={20}
              className="h-3.5 sm:h-4 w-auto partner-logo opacity-70 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>

      {/* Outlier Marquee Ticker Track */}
      <div className="flex gap-3 sm:gap-4 outlier-ticker-track">
        {/* Render sequence twice for seamless loop */}
        {[...TICKER_ARTISANS, ...TICKER_ARTISANS].map((artisan, index) => {
          const metric = TICKER_METRICS[index % TICKER_METRICS.length]!;
          return (
            <React.Fragment key={`ticker-${artisan.name}-${index}`}>
              {/* Profile Card */}
              <div className="w-[200px] sm:w-[230px] rounded-2xl border border-[var(--lead)] bg-[var(--bg)] p-3 flex items-center gap-3 shrink-0 shadow-sm hover:border-[#F7803C]/50 transition-colors">
                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-[var(--tag-bg)]">
                  <Image
                    src={artisan.avatar}
                    alt={artisan.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#2FE896] rounded-full border-2 border-[var(--bg)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-[var(--text-main)] truncate">
                      {artisan.name}
                    </p>
                    <BadgeCheck className="w-3.5 h-3.5 text-[#2FE896] shrink-0" />
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">
                    {artisan.trade}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5 text-[10px] text-[var(--text-muted)] font-mono">
                    <span className="flex items-center gap-0.5 text-[#F7803C] font-semibold">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {artisan.rating}
                    </span>
                    <span>•</span>
                    <span className="truncate">{artisan.jobs}</span>
                  </div>
                </div>
              </div>

              {/* Interleaved Stat Pill Card */}
              {index % 2 === 0 && (
                <div className="w-[170px] sm:w-[190px] rounded-2xl border border-[var(--lead)] bg-gradient-to-br from-[var(--bg)] to-[var(--card-hover)] p-3 flex flex-col justify-center shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-extrabold text-[var(--text-main)] tracking-tight">
                      {metric.value}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-[#2FE896]" />
                  </div>
                  <p className="text-[11px] font-semibold text-[var(--text-main)] truncate">
                    {metric.label}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate">
                    {metric.sub}
                  </p>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
