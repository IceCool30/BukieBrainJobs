'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Menu,
  MapPin,
  ChevronDown,
  X,
  History,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  SERVICE_CATEGORIES,
  ServiceCategory,
  NIGERIAN_LOCATIONS,
  NigerianLocation,
} from '../lib/mock/homepage-data';
import PartnerBar from './PartnerBar';
import FeaturedBrainWorkers from './FeaturedBrainWorkers';
import HowItWorks from './HowItWorks';
import FAQSection from './FAQSection';
import ServiceCategoryRail from './ServiceCategoryRail';

interface PwaHomeProps {
  onOpenDrawer: () => void;
  onSearchSubmit?: (service: string, location: string) => void;
  onSelectCategory?: (category: ServiceCategory) => void;
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

const TRENDING_SEARCHES = [
  'Generator Servicing',
  'AC Gas Recharge',
  'Solar Inverter Setup',
  'Plumbing & Water Tanks',
  'Deep Cleaning',
  'DSTV Dish Mounting',
];

export default function PwaHome({
  onOpenDrawer,
  onSearchSubmit,
  onSelectCategory,
}: PwaHomeProps) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(['AC Gas Refill', 'Mikano Generator']);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
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
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [servicesVisible, setServicesVisible] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (searchContainerRef.current?.contains(event.target as Node)) return;
      setSearchOpen(false);
      setLocationOpen(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
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

  const matched = getMatched(query);

  const handleSelectLocation = (loc: NigerianLocation) => {
    setLocationOpen(false);
    setSearchOpen(false);
    setSelectedLocation(loc);
  };

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((items) => {
      const updated = [term, ...items.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 5);
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

  const executeSearch = (term = query) => {
    const finalQuery = term.trim() || 'All Services';
    saveRecentSearch(finalQuery);
    setSearchOpen(false);
    setLocationOpen(false);

    const exact = SERVICE_CATEGORIES.find((category) => category.title.toLowerCase() === finalQuery.toLowerCase());
    if (exact) {
      onSelectCategory?.(exact);
      return;
    }
    onSearchSubmit?.(finalQuery, selectedLocation.name);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const selected = matched[highlightedIndex];
    if (selected) {
      setQuery(selected.title);
      executeSearch(selected.title);
      return;
    }
    executeSearch();
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setSearchOpen(false);
      event.currentTarget.blur();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((index) => (index < matched.length - 1 ? index + 1 : 0));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((index) => (index > 0 ? index - 1 : matched.length - 1));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] pb-12">
      {/* Compact photo-governed mobile hero */}
      <section className="relative min-h-[340px] pb-6">
        <Image
          src="/images/hero-portrait-1920.png"
          alt="BukieBrainJobs BrainWorkers at work"
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

        <div className="relative z-10 flex items-center justify-between px-4 pt-3.5">
          <Image
            src="/images/logo-icon.png"
            alt="BukieBrainJobs"
            width={32}
            height={32}
            className="h-8 w-8 rounded-xl object-contain"
            priority
          />

          <button
            onClick={onOpenDrawer}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#001A41] text-white shadow-sm transition-colors hover:bg-[#000F2D]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Hero Title & Mobile Search */}
        <div className="relative z-10 px-4 pt-8 text-left space-y-3">
          <h1 className="font-display font-extrabold text-[19px] leading-snug tracking-tight text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ABEEC8] to-[#5FD8A5]">
              BukieBrainJobs
              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-[#ABEEC8] to-transparent" />
            </span>
            .
          </h1>

          <div ref={searchContainerRef} className="relative">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col items-stretch gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 shrink-0 text-slate-400" />
                <input
                  ref={searchInputRef}
                  id="pwa-search-input"
                  name="searchQuery"
                  aria-label="Search for a service"
                  aria-autocomplete="list"
                  aria-controls={query.trim() ? 'pwa-service-suggestions' : undefined}
                  aria-activedescendant={
                    highlightedIndex >= 0 ? `pwa-service-option-${matched[highlightedIndex]?.id}` : undefined
                  }
                  aria-expanded={searchOpen && !locationOpen}
                  role="combobox"
                  type="text"
                  autoComplete="off"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setHighlightedIndex(-1);
                    setLocationOpen(false);
                    setSearchOpen(true);
                  }}
                  onFocus={() => {
                    setLocationOpen(false);
                    setSearchOpen(true);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="What service do you need?"
                  className="h-11 w-full rounded-xl bg-transparent pl-10 pr-8 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setHighlightedIndex(-1);
                      setLocationOpen(false);
                      setSearchOpen(true);
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex gap-1.5">
                <div className="relative min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setLocationOpen((open) => !open);
                    }}
                    aria-expanded={locationOpen}
                    aria-controls="pwa-location-options"
                    className="flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[#296A4B]" />
                    <span className="truncate">{selectedLocation.name}</span>
                    <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
                  </button>

                  {locationOpen && (
                      <div
                        id="pwa-location-options"
                        role="listbox"
                        aria-label="Choose a location"
                        className="absolute left-0 top-full z-[60] mt-2 w-full min-w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl"
                      >
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Available locations
                      </div>
                      {NIGERIAN_LOCATIONS.filter((location) => location.status === 'active').map((location) => (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => handleSelectLocation(location)}
                          role="option"
                          aria-selected={selectedLocation.id === location.id}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors ${
                            selectedLocation.id === location.id
                              ? 'bg-[#EFF4FF] font-bold text-[#001A41]'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {location.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{location.popularArea}</span>
                        </button>
                      ))}

                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="motion-press flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#296A4B] px-5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#1F523A] active:bg-[#17402C]"
                >
                  <span>Search</span>
                  <ArrowRight className="h-4 w-4 text-[#ABEEC8]" />
                </button>
              </div>
            </form>

            {searchOpen && !locationOpen && (
              <div
                id="pwa-service-suggestions"
                role={query.trim() ? 'listbox' : undefined}
                aria-label={query.trim() ? 'Service suggestions' : undefined}
                className="motion-popover relative z-50 mt-2 max-h-[320px] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_-12px_rgba(0,26,65,0.3)]"
              >
                {!query.trim() && (
                  <div className="space-y-3">
                    {recentSearches.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <History className="h-3.5 w-3.5" />
                            Recent searches
                          </span>
                          <button
                            type="button"
                            onClick={clearRecentSearches}
                            className="text-[10px] lowercase text-slate-400 hover:text-slate-600 cursor-pointer"
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
                                setQuery(term);
                                executeSearch(term);
                              }}
                              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 cursor-pointer"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 border-t border-slate-100 pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <TrendingUp className="h-3.5 w-3.5 text-[#296A4B]" />
                        Services to explore
                      </div>
                      <div className="grid gap-1.5">
                        {TRENDING_SEARCHES.slice(0, 4).map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setQuery(term);
                              executeSearch(term);
                            }}
                            className="flex items-center justify-between rounded-xl border border-transparent p-2 text-left text-xs font-medium text-slate-700 transition-colors hover:border-slate-200 hover:bg-[#EFF4FF] hover:text-[#001A41] cursor-pointer"
                          >
                            <span className="truncate">{term}</span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {query.trim() && (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Matching services
                    </div>
                    {matched.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-slate-500">
                        We couldn&apos;t find a close match for &quot;{query}&quot;. Search to browse the services shown here.
                      </div>
                    ) : (
                      matched.map((category, index) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            setQuery(category.title);
                            setSearchOpen(false);
                            onSelectCategory?.(category);
                          }}
                          id={`pwa-service-option-${category.id}`}
                          role="option"
                          aria-selected={highlightedIndex === index}
                          className={`motion-press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                            highlightedIndex === index
                              ? 'bg-[#EFF4FF] font-semibold text-[#001A41]'
                              : 'text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            <Image src={category.photoUrl} alt={category.title} fill sizes="40px" className="object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold text-[#001A41]">{category.title}</span>
                            <span className="block truncate text-[11px] text-slate-500">
                              {category.popularServices.slice(0, 2).join(' · ')}
                            </span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="block text-xs font-extrabold text-[#296A4B]">From {category.startingPrice}</span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="ml-auto max-w-[290px] pt-1 text-right text-[13px] font-bold leading-snug text-slate-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              Find a BrainWorker for the job, or offer your skills for work that respects your time.
            </p>
        </div>
      </section>

      <PartnerBar compact />

      {/* Popular Services Grid */}
      <div ref={servicesRef} className={`motion-reveal px-4 pt-6${servicesVisible ? ' is-visible' : ''}`}>
        <div className="motion-reveal-item">
          <ServiceCategoryRail onSelectCategory={onSelectCategory} />
        </div>

        <div className="motion-reveal-item flex items-baseline justify-between pt-5">
          <h2 className="font-display font-bold text-[17px] text-[#001A41]">Browse services</h2>
          <Link href="/services" className="motion-press text-[13px] font-semibold text-[#296A4B]">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
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

      <FeaturedBrainWorkers profileCity={selectedLocation.name} />
      <HowItWorks />
      <FAQSection />
    </div>
  );
}
