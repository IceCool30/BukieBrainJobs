'use client';

import React, { useState } from 'react';
import { Search, MapPin, ShieldCheck, Lock, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';
import { NIGERIAN_LOCATIONS, NigerianLocation } from '../lib/mock/homepage-data';

interface HeroSectionProps {
  onSearchSubmit?: (service: string, location: NigerianLocation) => void;
  onLocationNotice?: (location: NigerianLocation) => void;
}

export default function HeroSection({ onSearchSubmit, onLocationNotice }: HeroSectionProps) {
  const [serviceQuery, setServiceQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<NigerianLocation>(
    NIGERIAN_LOCATIONS[0] || { id: 'lagos', name: 'Lagos', state: 'Lagos State', status: 'active' }
  );
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const popularQuickSearches = [
    'Generator Repair',
    'AC Gas Refill',
    'Plumbing Tank',
    'Solar Setup',
    'Deep Cleaning',
    'DSTV Mounting',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLocation.status === 'soon') {
      onLocationNotice?.(selectedLocation);
    } else {
      onSearchSubmit?.(serviceQuery || 'All Services', selectedLocation);
    }
  };

  const handleSelectLocation = (loc: NigerianLocation) => {
    setSelectedLocation(loc);
    setShowLocationDropdown(false);
    if (loc.status === 'soon') {
      onLocationNotice?.(loc);
    }
  };

  return (
    <section className="relative bg-[#001A41] text-white pt-12 pb-20 overflow-hidden border-b border-[#1E3A60]">
      {/* Decorative Subtle Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#296A4B]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1E3A60]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Sub-badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#06152B] border border-[#296A4B]/50 text-xs font-semibold text-[#ABEEC8]">
            <Sparkles className="w-3.5 h-3.5 text-[#296A4B]" />
            <span>Biometric Verified Artisans across Nigeria</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white leading-tight">
            Find trusted Nigerian professionals for every <span className="text-[#ABEEC8]">home &amp; business</span> service.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            From generator servicing and AC repairs to plumbing and solar setups. Verified with NIN/BVN biometrics and backed by Escrow protection.
          </p>

          {/* Primary Action (LEVEL 1 CTA: Search for a Service) */}
          <div className="pt-4 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-full shadow-2xl border border-slate-200 text-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              {/* Service Input */}
              <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2">
                <Search className="w-5 h-5 text-[#296A4B] shrink-0" />
                <input
                  type="text"
                  value={serviceQuery}
                  onChange={(e) => setServiceQuery(e.target.value)}
                  placeholder="What service do you need? (e.g. AC Repair, Plumbing...)"
                  className="w-full text-sm font-medium text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-slate-200" />

              {/* Location Dropdown Selector */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl sm:rounded-full bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 border border-slate-200 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-[#296A4B]" />
                  <span>{selectedLocation.name}</span>
                  {selectedLocation.status === 'soon' && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                      Soon
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {showLocationDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-left">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Location
                    </div>
                    {NIGERIAN_LOCATIONS.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelectLocation(loc)}
                        className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{loc.name}</div>
                          <div className="text-[10px] text-slate-500">{loc.popularArea}</div>
                        </div>
                        {loc.status === 'active' ? (
                          <span className="text-[10px] bg-[#ABEEC8] text-[#2E6E4F] px-1.5 py-0.5 rounded font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                            Coming Soon
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary Search Button (LEVEL 1 CTA) */}
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#001A41] hover:bg-[#000F2D] text-white font-semibold text-sm rounded-xl sm:rounded-full transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Search</span>
                <Search className="w-4 h-4 text-[#ABEEC8]" />
              </button>
            </form>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Popular:</span>
            {popularQuickSearches.map((item) => (
              <button
                key={item}
                onClick={() => setServiceQuery(item)}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition-all text-[11px]"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Trust Guarantee Strip */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto border-t border-[#1E3A60]/60">
            <div className="flex items-center gap-3 bg-[#06152B]/60 p-3 rounded-xl border border-[#1E3A60]">
              <ShieldCheck className="w-6 h-6 text-[#ABEEC8] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">NIN / BVN Biometrics</div>
                <div className="text-[11px] text-slate-400">BukiePassport Tier 2</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#06152B]/60 p-3 rounded-xl border border-[#1E3A60]">
              <Lock className="w-6 h-6 text-[#ABEEC8] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">100% Escrow Protection</div>
                <div className="text-[11px] text-slate-400">Funds held safely</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#06152B]/60 p-3 rounded-xl border border-[#1E3A60]">
              <CheckCircle2 className="w-6 h-6 text-[#ABEEC8] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-white">BukieGuarantee</div>
                <div className="text-[11px] text-slate-400">Up to ₦500k Protection</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
