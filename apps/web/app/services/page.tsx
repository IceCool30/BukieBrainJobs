'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  Wind,
  Wrench,
  Sun,
  Sparkles,
  Hammer,
  Tv,
  Truck,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { SERVICE_CATEGORIES, ServiceCategory } from '../../lib/mock/homepage-data';
import DirectBookingModal from '../../components/modals/DirectBookingModal';

const ICONS: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-5 h-5 text-[#296A4B]" />,
  Wind: <Wind className="w-5 h-5 text-[#296A4B]" />,
  Wrench: <Wrench className="w-5 h-5 text-[#296A4B]" />,
  Sun: <Sun className="w-5 h-5 text-[#296A4B]" />,
  Sparkles: <Sparkles className="w-5 h-5 text-[#296A4B]" />,
  Hammer: <Hammer className="w-5 h-5 text-[#296A4B]" />,
  Tv: <Tv className="w-5 h-5 text-[#296A4B]" />,
  Truck: <Truck className="w-5 h-5 text-[#296A4B]" />,
};

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const groups = ['All', ...Array.from(new Set(SERVICE_CATEGORIES.map((c) => c.group)))];

  const filteredCategories = SERVICE_CATEGORIES.filter((cat) => {
    const matchesGroup = selectedGroup === 'All' || cat.group === selectedGroup;
    const matchesQuery =
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.popularServices.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesQuery;
  });

  return (
    <main className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <div className="bg-[#001A41] text-white border-b border-[#1E3A60]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#001A41]/95 to-[#001A41]/60" />
          <div className="relative z-10 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              All Marketplace Services & Starting Rates
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Every service starts at the transparent rate shown. Your funds are secured in escrow until you inspect and approve the completed job.
            </p>

            {/* Filter Search Bar */}
            <div className="pt-2 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by service name, trade, or task..."
                  className="w-full h-11 pl-10 pr-4 text-xs font-medium text-slate-900 bg-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Category Group Tabs */}
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedGroup === group
                  ? 'bg-[#001A41] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
                    {ICONS[cat.iconName]}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {cat.group}
                  </span>
                </div>

                <div>
                  <h2 className="font-display font-bold text-base text-[#0B1C30]">{cat.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{cat.description}</p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Common tasks
                  </div>
                  <ul className="space-y-1">
                    {cat.popularServices.map((s) => (
                      <li key={s} className="text-xs text-slate-700 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#296A4B]" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Starting from</span>
                  <span className="font-bold text-[#001A41] text-base">{cat.startingPrice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Book Service
                  <ArrowRight className="w-3.5 h-3.5 text-[#ABEEC8]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#296A4B]" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display font-bold text-base text-[#0B1C30]">
              The price agreed is the price held in escrow
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              Every BrainWorker quotes against verified trade standards. If unexpected parts are needed on-site, the quote must be approved by you before work proceeds.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <Image
            src="/images/wordmark-banner-tight.png?v=3"
            alt="BukieBrainJobs"
            width={150}
            height={44}
            priority={false}
            className="opacity-70"
          />
        </div>
      </div>

      {/* Booking Modal */}
      <DirectBookingModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        serviceCategory={selectedCategory}
      />
    </main>
  );
}
