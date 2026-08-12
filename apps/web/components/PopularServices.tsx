'use client';

import React, { useState } from 'react';
import {
  Zap,
  Wind,
  Wrench,
  Sun,
  Sparkles,
  Hammer,
  Tv,
  Truck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { SERVICE_CATEGORIES, ServiceCategory } from '../lib/mock/homepage-data';

interface PopularServicesProps {
  onSelectCategory?: (category: ServiceCategory) => void;
}

export default function PopularServices({ onSelectCategory }: PopularServicesProps) {
  const [activeTab, setActiveTab] = useState<'All' | 'Power & Cooling' | 'Utilities & Structure' | 'Home & Lifestyle'>('All');

  const filteredCategories = activeTab === 'All'
    ? SERVICE_CATEGORIES
    : SERVICE_CATEGORIES.filter((c) => c.group === activeTab);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-[#296A4B]" />;
      case 'Wind': return <Wind className="w-5 h-5 text-[#296A4B]" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-[#296A4B]" />;
      case 'Sun': return <Sun className="w-5 h-5 text-[#296A4B]" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-[#296A4B]" />;
      case 'Hammer': return <Hammer className="w-5 h-5 text-[#296A4B]" />;
      case 'Tv': return <Tv className="w-5 h-5 text-[#296A4B]" />;
      case 'Truck': return <Truck className="w-5 h-5 text-[#296A4B]" />;
      default: return <Wrench className="w-5 h-5 text-[#296A4B]" />;
    }
  };

  return (
    <section id="services" className="py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#296A4B] uppercase tracking-wider mb-1">
              Curated Marketplace Categories
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0B1C30]">
              Popular Everyday Services
            </h2>
          </div>

          {/* Group Tabs */}
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {(['All', 'Power & Cooling', 'Utilities & Structure', 'Home & Lifestyle'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full transition-all border ${
                  activeTab === tab
                    ? 'bg-[#001A41] text-white border-[#001A41] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Category Grid (12-column layout mapping: 3 cards per row on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory?.(cat)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#296A4B]/40 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#E5EEFF] border border-[#CBDBF5] flex items-center justify-center group-hover:bg-[#ABEEC8]/40 transition-colors">
                    {getIcon(cat.iconName)}
                  </div>
                  <span className="text-[11px] font-bold text-[#001A41] bg-slate-100 px-2 py-0.5 rounded-full">
                    From {cat.startingPrice}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-[#0B1C30] group-hover:text-[#296A4B] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  {cat.popularServices.map((service, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3 h-3 text-[#296A4B]" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-[#001A41] group-hover:text-[#296A4B]">
                <span>Browse Pros</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
