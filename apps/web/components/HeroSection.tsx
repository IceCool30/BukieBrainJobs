'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import{ Search, ShieldCheck, Award, Lock, Star } from 'lucide-react';
import { NIGERIAN_LOCATIONS } from '../lib/mock/homepage-data';

interface HeroSectionProps {
  onSearchSubmit?: (service: string, location: string) => void;
}

export default function HeroSection({ onSearchSubmit }: HeroSectionProps) {
  const [serviceQuery, setServiceQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const input = document.getElementById('hero-service-input');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const popularQuickSearches = [
    'Plumbing',
    'AC Repair',
    'Cleaning',
    'Generator Repair',
    'Solar Setup',
    'DSTV Mounting',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.(serviceQuery || 'All Services', NIGERIAN_LOCATIONS[0]?.name || 'Lagos');
  };

  return (
    <section className="relative bg-[#001A41] text-white pt-20 pb-12 overflow-hidden">
      {/* Hero portrait backdrop */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 768px)" srcSet="/images/hero-mobile-1080.jpg" />
          <Image
            src="/images/hero-portrait-1920.png"
            alt="Verified BukieBrainJobs artisans against the Lagos waterfront"
            fill
            priority
            className="object-cover"
            style={{ objectPosition: "50% 50%" }}
          />
        </picture>
        {/* Desktop overlay: thin navy veil at the left edge only, photo governs the rest */}
        <div className="absolute inset-y-0 left-0 w-[38%] hidden md:block bg-gradient-to-r from-[#001A41]/60 to-[#001A41]/0" />
        {/* Mobile overlay: navy only at the very bottom edge so text stays readable */}
        <div className="absolute inset-x-0 bottom-0 h-[26%] block md:hidden bg-gradient-to-t from-[#001A41]/88 via-[#001A41]/45 to-[#001A41]/0" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl text-left space-y-6">

          {/* Live Operational Signal */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#001A41]/80 backdrop-blur-sm border border-[#296A4B]/60 text-xs font-semibold text-[#ABEEC8]">
            <span className="w-2 h-2 rounded-full bg-[#ABEEC8] animate-pulse shrink-0" />
            <span>48 Verified Artisans Online in Lagos &amp; Abuja today</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[3.4rem] tracking-tight text-white leading-[1.12] sm:leading-[1.08]">
            Skilled hands, on demand.
            <br />
            Trusted from the start.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl hidden md:block">
            Book verified artisans and technicians across Nigeria. Every job is
            protected by escrow, so money moves only when the work is done to
            your standard.
          </p>

          {/* Primary Search Row: one clean service field, TaskRabbit search-pill pattern */}
          <div className="pt-5 max-w-2xl w-full">
            <form
              onSubmit={handleSearch}
              className="flex items-stretch gap-0 bg-white rounded-xl shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
              style={{ borderRadius: '16px' }}
            >
              <div className="relative flex-1 min-w-0 flex items-center">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                <input
                  id="hero-service-input"
                  type="text"
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(serviceQuery.length === 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="What service do you need? e.g. plumbing, AC repair"
                  className="w-full h-[56px] pl-11 pr-14 text-[15px] font-medium text-slate-900 bg-white focus:outline-none placeholder:text-slate-400"
                />
                <span className="hidden sm:inline-flex items-center justify-center absolute right-3 px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200 pointer-events-none">
                  /
                </span>
                {showSuggestions && serviceQuery.trim() === '' && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-b-lg shadow-xl border border-t-0 border-slate-100 py-2 z-50">
                    {popularQuickSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setServiceQuery(item);
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-left text-slate-800 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <Search className="w-4 h-4 text-slate-400" />
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2.5 bg-[#296A4B] hover:bg-[#1f5239] active:bg-[#17402c] text-white font-semibold text-[15px] px-8 h-[56px] transition-colors"
                aria-label="Search services"
              >
                <Search className="w-[18px] h-[18px]" />
                Search
              </button>
            </form>


          </div>

          {/* Trust line: one quiet row, ratings first as the strongest proof */}
          <div className="pt-7 hidden md:flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <div className="flex text-[#ABEEC8]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#ABEEC8]" />
                ))}
              </div>
              <span className="text-sm font-semibold text-white">4.8/5</span>
              <span className="text-sm text-slate-400">from 9,400+ reviews</span>
            </div>
            <div className="flex items-center gap-x-2.5 gap-y-1 text-slate-400 flex-wrap">
              <ShieldCheck className="w-4 h-4 text-[#ABEEC8]" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Verified professionals</span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <Award className="w-4 h-4 text-[#ABEEC8]" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Escrow protected</span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <Lock className="w-4 h-4 text-[#ABEEC8]" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Secure payments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
