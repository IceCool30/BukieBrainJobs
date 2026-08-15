'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Menu } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../lib/mock/homepage-data';

export default function PwaHome({ onOpenDrawer, onOpenSearch }: { onOpenDrawer: () => void; onOpenSearch: () => void }) {
  const [query, setQuery] = useState('');

  const matched = query.trim()
    ? SERVICE_CATEGORIES.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-[#F8F9FF] pb-10">
      {/* Compact photo-governed hero: headline and search centered over the photo */}
      <section className="relative h-[320px]">
        <img
          src="/images/hero-portrait-1920.png"
          alt="Verified BukieBrainJobs artisans against the Lagos waterfront"
          className="absolute inset-0 h-full w-full object-cover object-[78%_52%]"
          fetchPriority="high"
        />
        {/* Navy accents on left, right, and bottom only; faces and top stay clear */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 115% 100% at 55% 38%, transparent 48%, rgba(0,26,65,0.32) 100%)', mixBlendMode: 'multiply' }} />
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-[#001A41]/90 via-[#001A41]/40 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[30%] bg-gradient-to-l from-[#001A41]/55 to-[#001A41]/0" />

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
            Book a skilled local or remote worker in minutes, or find flexible work that pays what you are worth. Only on BukieBrainJobs.
          </h1>
          <div className="relative mt-3 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={"Try 'mount TV' or 'leaky faucet'"}
              className="w-full h-[44px] pl-9 pr-4 rounded-xl bg-white text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
            />
            {matched.length > 0 && (
              <div className="absolute left-0 right-0 bottom-full mb-1.5 bg-white rounded-xl shadow-[0_12px_32px_-12px_rgba(0,26,65,0.35)] py-1.5 z-40">
                {matched.map((c) => (
                  <Link
                    key={c.id}
                    href="/services"
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50"
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
        </div>
      </section>

      {/* Quiet service grid, same card language as the desktop site */}
      <div className="px-4 pt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display font-bold text-[17px] text-[#001A41]">Popular services</h2>
          <button onClick={onOpenSearch} className="text-[13px] font-medium text-[#296A4B]">
            See all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          {SERVICE_CATEGORIES.slice(0, 6).map((cat) => (
            <Link key={cat.id} href="/services" className="block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-[0_1px_4px_-1px_rgba(0,26,65,0.12),0_4px_12px_-2px_rgba(0,26,65,0.08)]">
                <img src={cat.photoUrl} alt={cat.title} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/55 to-transparent" />
                <span className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-white drop-shadow">
                  From {cat.startingPrice}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] font-medium text-slate-700 leading-snug">{cat.title}</p>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
