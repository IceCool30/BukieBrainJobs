'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Search,
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
  'Generator servicing',
  'AC repair and gas refill',
  'Solar inverter setup',
  'Plumbing and water tanks',
  'Deep cleaning',
  'DSTV dish alignment',
];

export default function HeroSection({
  onSearchSubmit,
  onSelectCategory,
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

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bbj_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed.slice(0, 5));
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Keyboard shortcut '/'
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
    setSelectedLocation(loc);
  };

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('bbj_recent_searches', JSON.stringify(updated));
      } catch {
        // safe fallback
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('bbj_recent_searches');
    } catch {
      // safe fallback
    }
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
    <section className="relative pt-24 sm:pt-28 pb-6 px-3 sm:px-6 lg:px-8 overflow-visible">
      {/* Outlier High-Curvature Fluid Container Banner */}
      <div className="relative max-w-[1280px] mx-auto rounded-[24px] md:rounded-[48px] bg-gradient-to-b from-[#161B24] via-[#0E1218] to-[#0B0E13] border border-white/10 p-6 sm:p-10 md:p-16 overflow-hidden shadow-2xl">
        {/* Ambient Warm Coral Radial Glow */}
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none opacity-25 blur-3xl rounded-full"
          style={{ background: 'radial-gradient(circle, #F7803C 0%, rgba(247, 128, 60, 0) 70%)' }}
        />

        {/* Hero portrait backdrop subtle blend */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30 mix-blend-luminosity pointer-events-none">
          <picture className="relative block h-full w-full">
            <source media="(max-width: 767px)" srcSet="/images/hero-mobile-1080.jpg" />
            <Image
              src="/images/hero-portrait-1920.png"
              alt="BukieBrainJobs BrainWorkers at work"
              fill
              priority
              className="object-cover md:object-[70%_50%] lg:object-center"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E13] via-[#0B0E13]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl text-left space-y-6">

          {/* Outlier Punchy Typography */}
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.035em] text-white leading-[1.05]">
            Hire elite Nigerian artisans with total{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#F7803C] to-[#FFAB7B]">
              escrow protection
              <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-gradient-to-r from-[#F7803C] to-transparent" />
            </span>
            .
          </h1>

          <p className="max-w-xl text-sm sm:text-base font-medium leading-relaxed text-slate-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] lg:max-w-2xl">
            Find a BrainWorker for the job, or offer your skills for work that respects your time.
          </p>

          {/* Outlier Pill Search Bar */}
          <div ref={containerRef} className="relative w-full max-w-xl pt-2 lg:max-w-[46rem]">
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col sm:flex-row items-center gap-2 rounded-2xl sm:rounded-full border border-white/20 bg-[#161B22]/95 backdrop-blur-md p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all"
            >
              {/* Search query input */}
              <div className="relative flex-1 flex items-center w-full">
                <Search className="absolute left-4 h-5 w-5 shrink-0 text-slate-400" />
                <input
                  ref={inputRef}
                  id="hero-service-input"
                  name="serviceQuery"
                  aria-label="Search for a service"
                  aria-autocomplete="list"
                  aria-controls={serviceQuery.trim() ? 'hero-service-suggestions' : undefined}
                  aria-activedescendant={
                    highlightedIndex >= 0 ? `hero-service-option-${matches[highlightedIndex]?.id}` : undefined
                  }
                  aria-expanded={showSuggestions && !showLocationDropdown}
                  role="combobox"
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
                  className="h-12 sm:h-14 w-full rounded-full bg-transparent pl-12 pr-10 text-sm sm:text-base font-medium text-white placeholder:text-slate-400 focus:outline-none"
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
                    className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Location Pill Selector */}
              <div ref={locationDropdownRef} className="relative w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuggestions(false);
                    setShowLocationDropdown((prev) => !prev);
                  }}
                  aria-expanded={showLocationDropdown}
                  aria-controls="hero-location-options"
                  className="flex h-11 sm:h-12 w-full sm:w-auto items-center justify-between sm:justify-start gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-[#2FE896]" />
                  <span className="max-w-[140px] truncate">
                    {selectedLocation.name}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                </button>

                {/* Location Selection Dropdown */}
                {showLocationDropdown && (
                  <div
                    id="hero-location-options"
                    role="listbox"
                    aria-label="Choose a location"
                    className="absolute left-0 top-full mt-2 w-full min-w-56 bg-[#161B22] rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-fadeIn"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Available locations
                    </div>
                    {NIGERIAN_LOCATIONS.filter((l) => l.status === 'active').map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        role="option"
                        aria-selected={selectedLocation.id === loc.id}
                        className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                          selectedLocation.id === loc.id
                            ? 'bg-white/10 text-white font-bold'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2FE896]" />
                          <span>{loc.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{loc.popularArea}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Outlier Warm Coral Pill Action Button */}
              <button
                type="submit"
                className="outlier-pill-button flex h-11 sm:h-12 w-full sm:w-auto min-w-32 items-center justify-center gap-2 rounded-full bg-[var(--amber)] px-6 text-xs sm:text-sm font-bold text-[#001A41] shadow-md hover:bg-[var(--amber-hover)] transition-all font-mono uppercase tracking-wider shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4 text-[#001A41]" />
              </button>
            </form>

            {/* Rich Dropdown Suggestions */}
            {showSuggestions && !showLocationDropdown && (
              <div
                id="hero-service-suggestions"
                role={serviceQuery.trim() ? 'listbox' : undefined}
                aria-label={serviceQuery.trim() ? 'Service suggestions' : undefined}
                className="relative z-50 mt-2 max-h-[380px] space-y-3 overflow-y-auto rounded-2xl border border-white/15 bg-[#161B22] p-3 shadow-2xl text-white"
              >
                {/* Zero State: Recent & Trending */}
                {!serviceQuery.trim() && (
                  <div className="space-y-3">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" />
                            Recent searches
                          </span>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-[10px] text-slate-400 hover:text-white lowercase cursor-pointer"
                          >
                            Clear
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
                              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                            >
                              <span>{term}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested services */}
                    <div className="space-y-1.5 pt-1 border-t border-white/10">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-[#2FE896]" />
                        Services to explore
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
                            className="p-2.5 rounded-xl text-left text-xs font-medium text-slate-200 hover:bg-white/10 flex items-center justify-between border border-transparent hover:border-white/10 transition-colors cursor-pointer"
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
                      Matching services ({matches.length})
                    </div>
                    {matches.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-slate-400">
                        We couldn&apos;t find a close match for &quot;{serviceQuery}&quot;. Search to browse the services shown here.
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
                          id={`hero-service-option-${cat.id}`}
                          role="option"
                          aria-selected={highlightedIndex === idx}
                          className={`w-full px-3 py-2.5 rounded-xl text-left transition-colors flex items-center gap-3 ${
                            highlightedIndex === idx
                              ? 'bg-white/15 text-white font-semibold'
                              : 'text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/10">
                            <Image
                              src={cat.photoUrl}
                              alt={cat.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-white truncate">
                              {cat.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {cat.popularServices.slice(0, 2).join(' · ')}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-[#2FE896] block">
                              From {cat.startingPrice}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Trending Pills below Search */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Trending:</span>
            {TRENDING_SEARCHES.slice(0, 4).map((trend) => (
              <button
                key={trend}
                type="button"
                onClick={() => {
                  setServiceQuery(trend);
                  executeSearch(trend);
                }}
                className="px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:border-[#F7803C]/60 hover:bg-[#F7803C]/10 text-slate-300 hover:text-white text-xs font-medium transition-all"
              >
                {trend}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
