'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../lib/mock/homepage-data';

export default function PwaHome({ onOpenDrawer, onOpenSearch }: { onOpenDrawer: () => void; onOpenSearch: () => void }) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [servicesVisible, setServicesVisible] = useState(false);

  useEffect(() => {
    const target = servicesRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      setServicesVisible(true);
      observer.disconnect();
    }, { threshold: 0.15 });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const matched = searchOpen && query.trim()
    ? SERVICE_CATEGORIES.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-[#F8F9FF] pb-10">
      {/* Compact photo-governed hero: headline and search centered over the photo */}
      <section className="relative h-[320px]">
        <img
          src="/images/hero-portrait-1920.png"
          alt="BukieBrainJobs professionals at work"
          className="absolute inset-0 h-full w-full object-cover object-[78%_52%]"
          fetchPriority="high"
        />
        {/* Navy accents on left, right, and bottom only; faces and top stay clear */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 115% 100% at 55% 38%, transparent 48%, rgba(0,26,65,0.32) 100%)', mixBlendMode: 'multiply' }} />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#001A41]/90 via-[#001A41]/40 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[34%] bg-gradient-to-l from-[#001A41]/65 to-[#001A41]/0" />

        <div className="absolute inset-x-0 top-0 z-10 px-4 pt-3">
          <div className="flex items-center justify-between">
            <Image
              src="/images/logo-icon.png?v=3"
              alt="BukieBrainJobs"
              width={32}
              height={32}
              className="object-contain h-8 w-8 rounded-xl"
              priority
            />
            <button
              onClick={onOpenDrawer}
              className="flex h-9 w-9 items-center justify-center rounded-full"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 top-1/2 -translate-y-[38%] z-10 px-5 text-left">
          <h1 className="font-display font-extrabold text-[19px] leading-snug tracking-tight text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.55)]">
            Book a skilled local or remote worker in minutes, or find flexible
            work that pays what you are worth. Only on{' '}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#ABEEC8] to-[#5FD8A5]">
              BukieBrainJobs
              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-[#ABEEC8] to-transparent" />
            </span>
            .
          </h1>
          <div className="mt-3 max-w-md">
            <div className="relative h-[44px]">
              <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 w-[16px] h-[16px] text-slate-400 shrink-0 z-10" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    setSearchOpen(false);
                    event.currentTarget.blur();
                  }
                }}
                placeholder="Search for a service, for example plumbing"
                className="motion-input w-full h-[44px] pl-10 pr-4 rounded-xl bg-white text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:scale-[1.01] focus:shadow-[0_12px_26px_-12px_rgba(0,26,65,0.62)]"
              />
              {matched.length > 0 && (
                <div className="motion-popover motion-popover-mobile absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-[0_12px_32px_-12px_rgba(0,26,65,0.35)] py-1.5 z-40">
                  {matched.map((c) => (
                  <Link
                    key={c.id}
                    href="/services"
                    className="motion-press flex items-center gap-3 px-4 py-2.5 transition-colors duration-[140ms] hover:bg-slate-50"
                  >
                    <span className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img src={c.photoUrl} alt={c.title} className="w-full h-full object-cover" />
                    </span>
                    <span className="text-[14px] font-medium text-slate-800">{c.title}</span>
                    <span className="ml-auto text-[12px] text-slate-400">{c.startingPrice}</span>
                  </Link>
                ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-right text-[11px] leading-tight font-semibold text-white/90 max-w-xs ml-auto line-clamp-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              Find a professional for the job, or use your skills to find work that values your time.
            </p>
          </div>
        </div>
      </section>

      {/* Quiet service grid, same card language as the desktop site */}
      <div ref={servicesRef} className={`motion-reveal px-4 pt-6${servicesVisible ? ' is-visible' : ''}`}>
        <div className="motion-reveal-item flex items-baseline justify-between">
          <h2 className="font-display font-bold text-[17px] text-[#001A41]">Find a service</h2>
          <button onClick={onOpenSearch} className="motion-press text-[13px] font-medium text-[#296A4B]">
            View all services
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          {SERVICE_CATEGORIES.slice(0, 6).map((cat) => (
            <Link key={cat.id} href="/services" className="motion-press motion-reveal-item group block rounded-2xl active:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2">
              <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_10px_-6px_rgba(0,26,65,0.2)]">
                <img src={cat.photoUrl} alt={cat.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[180ms] ease-[var(--ease-ui-out)] group-active:scale-[1.035]" />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[#001A41] shadow-sm">
                  From {cat.startingPrice}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-snug text-[#001A41]">{cat.title}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
