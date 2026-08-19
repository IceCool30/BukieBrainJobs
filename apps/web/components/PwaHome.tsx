'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Search, Menu, MapPin, ChevronDown, X } from 'lucide-react';
import {
  SERVICE_CATEGORIES,
  ServiceCategory,
  BrainWorker,
  NIGERIAN_LOCATIONS,
  NigerianLocation,
} from '../lib/mock/homepage-data';
import PriceEstimator from './PriceEstimator';
import FeaturedBrainWorkers from './FeaturedBrainWorkers';
import HowItWorks from './HowItWorks';
import TestimonialsSection from './TestimonialsSection';
import MarketplacePaths from './MarketplacePaths';
import FAQSection from './FAQSection';

interface PwaHomeProps {
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
  onSelectCategory?: (category: ServiceCategory) => void;
  onSelectWorker?: (worker: BrainWorker) => void;
  onBookEstimate?: (
    serviceName: string,
    details?: {
      scopeName: string;
      city: string;
      priceRange: string;
      scopeNote: string;
    }
  ) => void;
  onPostJobClick?: () => void;
  onBecomeWorkerClick?: () => void;
  onSelectComingSoonLocation?: (location: NigerianLocation) => void;
}

const SYNONYM_MAP: Record<string, string[]> = {
  generator: ['gen', 'generator', 'nepa', 'changeover', 'mikano', 'perkins', 'firman', 'sumec', 'diesel', 'petrol', 'avr', 'oil change'],
  ac: ['ac', 'air conditioner', 'cooling', 'chiller', 'split unit', 'gas refill', 'r410', 'r22', 'standing ac', 'compressor'],
  solar: ['solar', 'inverter', 'battery', 'light', 'panel', 'backup', 'mppt', 'lithium'],
  plumbing: ['plumber', 'plumbing', 'pipe', 'leak', 'tank', 'overhead tank', 'pumping machine', 'pressure pump', 'water', 'tap', 'toilet', 'drain'],
  cleaning: ['clean', 'cleaning', 'fumigation', 'post tenant', 'house paint', 'deep clean', 'scrub', 'post-construction', 'janitorial'],
  tv: ['tv', 'television', 'dstv', 'gotv', 'dish', 'wall mount', 'cable', 'bracket'],
  electrical: ['electric', 'electrician', 'wiring', 'fuse', 'breaker', 'short circuit', 'socket', 'switch', 'light fitting'],
  carpentry: ['carpenter', 'carpentry', 'wood', 'furniture', 'door', 'lock', 'cabinet', 'wardrobe'],
};

export default function PwaHome({
  onOpenDrawer,
  onOpenSearch,
  onSelectCategory,
  onSelectWorker,
  onBookEstimate,
  onPostJobClick,
  onBecomeWorkerClick,
  onSelectComingSoonLocation,
}: PwaHomeProps) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<NigerianLocation>(
    NIGERIAN_LOCATIONS[0] || {
      id: 'lagos',
      name: 'Lagos',
      state: 'Lagos State',
      status: 'active',
      popularArea: 'Ikeja / Lekki / VI',
    }
  );
  const [locationOpen, setLocationOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [servicesVisible, setServicesVisible] = useState(false);

  useEffect(() => {
    const target = servicesRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setServicesVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const getMatched = (q: string): ServiceCategory[] => {
    const clean = q.trim().toLowerCase();
    if (!clean) return SERVICE_CATEGORIES.slice(0, 5);

    return SERVICE_CATEGORIES.filter((c) => {
      const matchTitle = c.title.toLowerCase().includes(clean);
      const matchSub = c.popularServices.some((s) => s.toLowerCase().includes(clean));
      let matchSyn = false;
      for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
        if (
          (c.id.includes(key) || c.title.toLowerCase().includes(key)) &&
          synonyms.some((syn) => syn.includes(clean) || clean.includes(syn))
        ) {
          matchSyn = true;
          break;
        }
      }
      return matchTitle || matchSub || matchSyn;
    });
  };

  const matched = searchOpen ? getMatched(query) : [];

  const handleSelectLocation = (loc: NigerianLocation) => {
    setLocationOpen(false);
    if (loc.status === 'soon') {
      onSelectComingSoonLocation?.(loc);
      return;
    }
    setSelectedLocation(loc);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] pb-12">
      {/* Compact photo-governed mobile hero */}
      <section className="relative min-h-[340px] pb-6">
        <Image
          src="/images/hero-portrait-1920.png"
          alt="BukieBrainJobs professionals at work"
          fill
          priority
          className="object-cover object-[78%_52%]"
        />
        {/* Navy overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 115% 100% at 55% 38%, transparent 48%, rgba(0,26,65,0.32) 100%)',
            mixBlendMode: 'multiply',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#001A41]/95 via-[#001A41]/50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[34%] bg-gradient-to-l from-[#001A41]/65 to-[#001A41]/0" />

        {/* Top Header Bar */}
        <div className="relative z-10 px-4 pt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo-icon.png?v=3"
              alt="BukieBrainJobs"
              width={32}
              height={32}
              className="object-contain h-8 w-8 rounded-xl"
              priority
            />
            {/* Quick City Pill */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setLocationOpen(!locationOpen);
              }}
              className="px-2.5 py-1 rounded-full bg-[#001A41]/80 backdrop-blur-sm border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1"
            >
              <MapPin className="w-3 h-3 text-[#ABEEC8]" />
              <span>{selectedLocation.name}</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-300" />
            </button>
          </div>

          <button
            onClick={onOpenDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Location Dropdown on Mobile */}
        {locationOpen && (
          <div className="relative z-50 px-4 pt-2">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-2 text-xs space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                Active Cities
              </div>
              {NIGERIAN_LOCATIONS.filter((l) => l.status === 'active').map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className={`w-full px-2.5 py-1.5 text-left rounded-lg flex items-center justify-between ${
                    selectedLocation.id === loc.id
                      ? 'bg-[#EFF4FF] text-[#001A41] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{loc.name}</span>
                  <span className="text-[10px] text-slate-400">{loc.popularArea}</span>
                </button>
              ))}

              <div className="border-t border-slate-100 my-1 pt-1 px-2 text-[10px] font-bold text-slate-400 uppercase">
                Coming Soon
              </div>
              {NIGERIAN_LOCATIONS.filter((l) => l.status === 'soon').map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full px-2.5 py-1.5 text-left rounded-lg text-slate-500 hover:bg-amber-50 flex items-center justify-between"
                >
                  <span>{loc.name}</span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded">Soon</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hero Title & Mobile Search */}
        <div className="relative z-10 px-4 pt-8 text-left space-y-3">
          <h1 className="font-display font-extrabold text-[19px] leading-snug tracking-tight text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Book a skilled local or remote worker in minutes, or find flexible
            work that pays what you are worth. Only on{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ABEEC8] to-[#5FD8A5]">
              BukieBrainJobs
              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-[#ABEEC8] to-transparent" />
            </span>
            .
          </h1>

          <div className="relative">
            <div className="relative h-[48px]">
              <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0 z-10" />
              <input
                id="pwa-search-input"
                name="searchQuery"
                aria-label="Search for a service"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                  setLocationOpen(false);
                  setSearchOpen(true);
                }}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                placeholder="What service do you need? (e.g. AC, Generator)"
                className="motion-input w-full h-[48px] pl-10 pr-4 rounded-xl bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] shadow-lg"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Dropdown Results */}
            {searchOpen && (
              <div className="motion-popover absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-[320px] overflow-y-auto">
                {matched.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500 text-center">
                    No matching services found for &quot;{query}&quot;.
                  </div>
                ) : (
                  matched.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        if (onSelectCategory) {
                          onSelectCategory(c);
                        }
                      }}
                      className="motion-press w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image src={c.photoUrl} alt={c.title} fill sizes="40px" className="object-cover" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#001A41] truncate">{c.title}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {c.popularServices.slice(0, 2).join(' · ')}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#296A4B] shrink-0">From {c.startingPrice}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <p className="ml-auto max-w-[290px] pt-1 text-right text-[13px] font-bold leading-snug text-slate-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              Find a professional for the job, or use your skills to find work that values your time
            </p>
        </div>
      </section>

      {/* Popular Services Grid */}
      <div ref={servicesRef} className={`motion-reveal px-4 pt-6${servicesVisible ? ' is-visible' : ''}`}>
        <div className="motion-reveal-item flex items-baseline justify-between">
          <h2 className="font-display font-bold text-[17px] text-[#001A41]">Popular Services</h2>
          <button onClick={onOpenSearch} className="motion-press text-[13px] font-semibold text-[#296A4B]">
            View all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          {SERVICE_CATEGORIES.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory?.(cat)}
              className="motion-press motion-reveal-item group text-left block rounded-2xl active:-translate-y-px focus-visible:outline-none"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                <Image
                  src={cat.photoUrl}
                  alt={cat.title}
                  fill
                  sizes="50vw"
                  className="object-cover transition-transform duration-[180ms] group-active:scale-[1.035]"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#001A41] shadow-sm">
                  From {cat.startingPrice}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-bold leading-snug text-[#001A41]">{cat.title}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Scope & Escrow Price Estimator (Mobile Enabled) */}
      <div className="pt-8">
        <PriceEstimator onBookEstimate={onBookEstimate} />
      </div>

      {/* Featured BrainWorkers (Vetted Nigerian Artisans) */}
      <div className="pt-2">
        <FeaturedBrainWorkers onSelectWorker={onSelectWorker} />
      </div>

      {/* How BukieBrainJobs Works */}
      <div className="pt-2">
        <HowItWorks />
      </div>

      {/* Customer Testimonials */}
      <div className="pt-2">
        <TestimonialsSection />
      </div>

      {/* Secondary Marketplace Pathways */}
      <div className="pt-2">
        <MarketplacePaths
          onPostJobClick={onPostJobClick}
          onBecomeWorkerClick={onBecomeWorkerClick}
        />
      </div>

      {/* Frequently Asked Questions */}
      <div className="pt-2">
        <FAQSection />
      </div>
    </div>
  );
}
