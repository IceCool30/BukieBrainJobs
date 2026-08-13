'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, ChevronDown, UserCheck, ShieldCheck } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../lib/mock/homepage-data';

const GROUPS: { heading: string; ids: string[] }[] = [
  { heading: 'Home Repairs', ids: ['plumbing', 'electrical', 'carpentry', 'tv-mounting'] },
  { heading: 'Power & Cooling', ids: ['generator', 'ac'] },
  { heading: 'Cleaning & Moving', ids: ['cleaning', 'moving'] },
];

const CHIPS = [
  'Plumbing help',
  'AC repair',
  'Generator service',
  'TV mounting',
  'Solar inverter',
  'DSTV setup',
  'Deep cleaning',
  'Moving help',
  'Electrical wiring',
];

export default function PwaHome({ onOpenDrawer, onOpenSearch }: { onOpenDrawer: () => void; onOpenSearch: () => void }) {
  const [query, setQuery] = useState('');

  const matched = query.trim()
    ? SERVICE_CATEGORIES.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={onOpenDrawer}
            className="flex items-center gap-2.5"
            aria-label="Open menu"
          >
            <Image
              src="/images/logo-icon.png?v=3"
              alt="BukieBrainJobs"
              width={32}
              height={32}
              className="object-contain h-8 w-8 rounded-xl"
              priority
            />
            <div className="flex items-center gap-1 text-[#001A41] text-[13px] font-semibold">
              <MapPin className="w-4 h-4 text-[#296A4B]" />
              Lagos
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#ABEEC8]" />
              Verified
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ABEEC8]" />
              Escrow
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6">
        <h1 className="font-display font-extrabold text-[26px] leading-tight text-[#001A41]">
          What do you need help with?
        </h1>

        {/* Search bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={"Try 'mount TV' or 'leaky faucet'"}
            className="w-full h-[48px] pl-10 pr-4 rounded-full bg-slate-100 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#296A4B]/40"
          />
          {matched.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-[0_12px_32px_-12px_rgba(0,26,65,0.25)] border border-slate-100 py-1.5 z-20">
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

      {/* Category rows, one group at a time */}
      <div className="px-4 pt-7 space-y-7">
        {GROUPS.map((group) => {
          const cats = SERVICE_CATEGORIES.filter((c) => group.ids.includes(c.id));
          return (
            <section key={group.heading}>
              <h2 className="font-display font-bold text-lg text-[#001A41]">{group.heading}</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {cats.map((cat) => (
                  <Link
                    key={cat.id}
                    href="/services"
                    className="shrink-0 w-[136px]"
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
                      <img
                        src={cat.photoUrl}
                        alt={cat.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-[10px] font-semibold text-white drop-shadow">
                        From {cat.startingPrice}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] font-medium text-slate-700 leading-snug">{cat.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* Everything else chips */}
        <section>
          <h2 className="font-display font-bold text-lg text-[#001A41]">Looking for something else?</h2>
          <div className="flex flex-wrap gap-2 pt-3">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={onOpenSearch}
                className="px-3.5 py-2 rounded-full text-[13px] font-medium text-[#296A4B] bg-[#ABEEC8]/25 border border-[#ABEEC8] hover:bg-[#ABEEC8]/40 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
