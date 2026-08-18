'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Search,
  ShieldCheck,
  Award,
  Lock,
  Star,
  MapPin,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  History,
  X,
} from 'lucide-react';
import {
  NIGERIAN_LOCATIONS,
  NigerianLocation,
  SERVICE_CATEGORIES,
  ServiceCategory,
} from '../lib/mock/homepage-data';

interface HeroSectionProps {
  onSearchSubmit?: (service: string, location: string) => void;
  onSelectCategory?: (category: ServiceCategory) => void;
  onSelectComingSoonLocation?: (location: NigerianLocation) => void;
}

const SYNONYM_MAP: Record<string, string[]> = {
  generator: [
    'gen',
    'generator',
    'nepa',
    'changeover',
    'mikano',
    'perkins',
    'firman',
    'sumec',
    'diesel',
    'petrol',
    'avr',
    'oil change',
    'rewinding',
  ],
  ac: [
    'ac',
    'air conditioner',
    'cooling',
    'chiller',
    'split unit',
    'gas refill',
    'r410',
    'r22',
    'standing ac',
    'compressor',
  ],
  solar: [
    'solar',
    'inverter',
    'battery',
    'light',
    'panel',
    'backup',
    'mppt',
    'lithium',
    'tubular',
  ],
  plumbing: [
    'plumber',
    'plumbing',
    'pipe',
    'leak',
    'tank',
    'overhead tank',
    'pumping machine',
    'pressure pump',
    'water',
    'tap',
    'toilet',
    'drain',
    'borehole',
  ],
  cleaning: [
    'clean',
    'cleaning',
    'fumigation',
    'post tenant',
    'house paint',
    'deep clean',
    'scrub',
    'post-construction',
    'janitorial',
  ],
  tv: [
    'tv',
    'television',
    'dstv',
    'gotv',
    'dish',
    'wall mount',
    'cable',
    'bracket',
    'satellite',
    'cctv',
  ],
  electrical: [
    'electric',
    'electrician',
    'wiring',
    'fuse',
    'breaker',
    'short circuit',
    'socket',
    'switch',
    'light fitting',
    'conduit',
  ],
  carpentry: [
    'carpenter',
    'carpentry',
    'wood',
    'furniture',
    'door',
    'lock',
    'cabinet',
    'wardrobe',
    'kitchen cabinet',
  ],
};

const TRENDING_SEARCHES = [
  'Generator Servicing',
  'AC Gas Recharge',
  'Solar Inverter Setup',
  'Plumbing & Water Tanks',
  'Deep Cleaning',
  'DSTV Dish Mounting',
];

export default function HeroSection({
  onSearchSubmit,
  onSelectCategory,
  onSelectComingSoonLocation,
}: HeroSectionProps) {
  const [serviceQuery, setServiceQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<NigerianLocation>(
    NIGERIAN_LOCATIONS[0] || {
      id: 'lagos',
      name: 'Lagos',
      state: 'Lagos State',
      status: 'active',
      popularArea: 'Ikeja / Lekki / VI',
    }
  );
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'AC Gas Refill',
    'Mikano Generator',
  ]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(e.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getMatchedCategories = (q: string): ServiceCategory[] => {
    const cleanQ = q.trim().toLowerCase();
    if (!cleanQ) return SERVICE_CATEGORIES.slice(0, 5);

    return SERVICE_CATEGORIES.filter((cat) => {
      const titleMatch = cat.title.toLowerCase().includes(cleanQ);
      const subMatch = cat.popularServices.some((s) =>
        s.toLowerCase().includes(cleanQ)
      );

      let synonymMatch = false;
      for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
        if (
          (cat.id.includes(key) || cat.title.toLowerCase().includes(key)) &&
          synonyms.some((syn) => syn.includes(cleanQ) || cleanQ.includes(syn))
        ) {
          synonymMatch = true;
          break;
        }
      }

      return titleMatch || subMatch || synonymMatch;
    });
  };

  const matches = getMatchedCategories(serviceQuery);

  const handleSelectLocation = (loc: NigerianLocation) => {
    setShowLocationDropdown(false);
    setShowSuggestions(false);
    if (loc.status === 'soon') {
      onSelectComingSoonLocation?.(loc);
      return;
    }
    setSelectedLocation(loc);
  };

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
      return [term, ...filtered].slice(0, 4);
    });
  };

  const executeSearch = (queryToUse?: string) => {
    const term = queryToUse !== undefined ? queryToUse : serviceQuery;
    const finalQuery = term.trim() || 'All Services';
    saveRecentSearch(finalQuery);
    setShowSuggestions(false);
    setShowLocationDropdown(false);

    const exact = SERVICE_CATEGORIES.find(
      (c) => c.title.toLowerCase() === finalQuery.toLowerCase()
    );
    if (exact && onSelectCategory) {
      onSelectCategory(exact);
      return;
    }

    onSearchSubmit?.(finalQuery, selectedLocation.name);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && matches[highlightedIndex]) {
      const selected = matches[highlightedIndex]!;
      setServiceQuery(selected.title);
      executeSearch(selected.title);
      return;
    }
    executeSearch();
  };

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      e.currentTarget.blur();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
    }
  };

  return (
    <section className="relative bg-[#001A41] text-white pt-28 sm:pt-32 pb-12 overflow-visible">
      {/* Hero portrait backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <picture>
          <source media="(max-width: 768px)" srcSet="/images/hero-mobile-1080.jpg" />
          <Image
            src="/images/hero-portrait-1920.png"
            alt="Verified BukieBrainJobs artisans against the Lagos waterfront"
            fill
            priority
            className="object-cover"
            style={{ objectPosition: '50% 50%' }}
          />
        </picture>
        <div className="absolute inset-y-0 left-0 w-[38%] hidden md:block bg-gradient-to-r from-[#001A41]/60 to-[#001A41]/0" />
        <div className="absolute inset-x-0 bottom-0 h-[26%] block md:hidden bg-gradient-to-t from-[#001A41]/88 via-[#001A41]/45 to-[#001A41]/0" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl text-left space-y-6">
          {/* Live Operational Signal */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#001A41]/85 backdrop-blur-md border border-[#ABEEC8]/50 text-xs font-semibold text-[#ABEEC8] shadow-[0_2px_10px_-3px_rgba(0,0,0,0.5)]">
            <span className="w-2 h-2 rounded-full bg-[#ABEEC8] animate-pulse shrink-0" />
            <span>Verified BrainWorkers active in {selectedLocation.name}</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[3rem] tracking-tight text-white leading-[1.15] sm:leading-[1.15]">
            Book a skilled local or remote worker in minutes, or find flexible
            work that pays what you are worth. Only on{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ABEEC8] to-[#5FD8A5]">
              BukieBrainJobs
              <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-[#ABEEC8] to-transparent" />
            </span>
            .
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed max-w-2xl hidden md:block">
            Find a professional for the job, or use your skills to find work that values your time.
          </p>

          {/* Unified Dual Service + Location Search Bar */}
          <div ref={containerRef} className="pt-4 max-w-2xl w-full relative">
            <form
              onSubmit={handleFormSubmit}
              className="bg-white rounded-2xl p-1.5 sm:p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 border border-slate-200"
            >
              {/* Service Input */}
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  id="hero-service-input"
                  name="serviceQuery"
                  aria-label="Search for a service"
                  type="text"
                  autoComplete="off"
                  value={serviceQuery}
                  onChange={(e) => {
                    setServiceQuery(e.target.value);
                    setHighlightedIndex(-1);
                    setShowLocationDropdown(false);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    setShowLocationDropdown(false);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={handleKeyDownInput}
                  placeholder="What service do you need? (e.g. AC, Generator)"
                  className="w-full h-11 sm:h-12 pl-10 pr-8 text-sm font-medium text-slate-900 bg-transparent rounded-xl focus:outline-none placeholder:text-slate-400"
                />
                {serviceQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setServiceQuery('');
                      setShowLocationDropdown(false);
                      setShowSuggestions(true);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Location Switcher Pill */}
              <div ref={locationDropdownRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuggestions(false);
                    setShowLocationDropdown((prev) => !prev);
                  }}
                  className="motion-press h-10 sm:h-12 px-3 sm:px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-between sm:justify-center gap-1.5 border border-slate-200 w-full sm:w-auto transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#296A4B] shrink-0" />
                  <span className="truncate max-w-[110px] sm:max-w-[130px]">
                    {selectedLocation.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {/* Location Selection Dropdown */}
                {showLocationDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Active Nigerian Cities
                    </div>
                    {NIGERIAN_LOCATIONS.filter((l) => l.status === 'active').map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                          selectedLocation.id === loc.id
                            ? 'bg-[#EFF4FF] text-[#001A41] font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{loc.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{loc.popularArea}</span>
                      </button>
                    ))}

                    <div className="border-t border-slate-100 my-1.5 pt-1.5 px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Coming Soon</span>
                      <span className="text-[9px] text-[#296A4B] font-normal">Notify Me</span>
                    </div>
                    {NIGERIAN_LOCATIONS.filter((l) => l.status === 'soon').map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full px-3 py-2 text-left text-xs font-medium text-slate-500 hover:bg-amber-50/70 hover:text-amber-900 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{loc.name}</span>
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold text-[9px]">
                          Soon
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="motion-press h-10 sm:h-12 px-5 bg-[#296A4B] hover:bg-[#1F523A] active:bg-[#17402C] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 text-[#ABEEC8]" />
              </button>
            </form>

            {/* Rich Dropdown Suggestions (Zero State & Active State) */}
            {showSuggestions && !showLocationDropdown && (
              <div className="motion-popover absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_16px_40px_-12px_rgba(0,26,65,0.3)] border border-slate-200 p-3 z-50 max-h-[380px] overflow-y-auto space-y-3">
                {/* Zero State: Recent & Trending */}
                {!serviceQuery.trim() && (
                  <div className="space-y-3">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" />
                            Recent Searches
                          </span>
                          <button
                            type="button"
                            onClick={() => setRecentSearches([])}
                            className="text-[10px] text-slate-400 hover:text-slate-600 lowercase"
                          >
                            clear
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recentSearches.map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => {
                                setServiceQuery(term);
                                executeSearch(term);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                            >
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trending in City */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#296A4B]" />
                        Popular in {selectedLocation.name}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {TRENDING_SEARCHES.slice(0, 4).map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setServiceQuery(term);
                              executeSearch(term);
                            }}
                            className="p-2 rounded-xl text-left text-xs font-medium text-slate-700 hover:bg-[#EFF4FF] hover:text-[#001A41] flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors"
                          >
                            <span className="truncate">{term}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Active State: Matched Categories */}
                {serviceQuery.trim().length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      Matched Services ({matches.length})
                    </div>
                    {matches.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-slate-500">
                        No exact match found for &quot;{serviceQuery}&quot;. Press Search to see all available categories.
                      </div>
                    ) : (
                      matches.map((cat, idx) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setServiceQuery(cat.title);
                            if (onSelectCategory) {
                              onSelectCategory(cat);
                              setShowSuggestions(false);
                            } else {
                              executeSearch(cat.title);
                            }
                          }}
                          className={`motion-press w-full px-3 py-2.5 rounded-xl text-left transition-colors flex items-center gap-3 ${
                            highlightedIndex === idx
                              ? 'bg-[#EFF4FF] text-[#001A41] font-semibold'
                              : 'text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <Image
                              src={cat.photoUrl}
                              alt={cat.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-[#001A41] truncate">
                              {cat.title}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {cat.popularServices.slice(0, 2).join(' · ')}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-[#296A4B] block">
                              From {cat.startingPrice}
                            </span>
                            <span className="text-[10px] text-slate-400">held in escrow</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quick search chips */}
            <div className="flex flex-wrap items-center gap-2 pt-3">
              <span className="text-xs text-slate-300 font-medium mr-1">Popular:</span>
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setServiceQuery(term);
                    executeSearch(term);
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-100 hover:text-white transition-colors border border-white/15 cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Trust line */}
          <div className="pt-7 hidden md:flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Star className="w-4 h-4 text-[#ABEEC8]" />
              <span>Review profiles before you book</span>
            </div>
            <div className="flex items-center gap-x-2.5 gap-y-1 text-slate-400 flex-wrap">
              <ShieldCheck className="w-4 h-4 text-[#ABEEC8]" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Profile Verification</span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <Award className="w-4 h-4 text-[#ABEEC8]" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Pay through Escrow</span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <Lock className="w-4 h-4 text-[#ABEEC8]" />
              <span className="text-xs sm:text-sm whitespace-nowrap">Clear booking details</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
