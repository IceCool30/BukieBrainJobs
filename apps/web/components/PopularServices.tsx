'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { SERVICE_CATEGORIES, ServiceCategory } from '../lib/mock/homepage-data';
import ServiceCategoryRail from './ServiceCategoryRail';

interface PopularServicesProps {
  onSelectCategory?: (category: ServiceCategory) => void;
}

export default function PopularServices({ onSelectCategory }: PopularServicesProps) {
  return (
    <section id="services" className="bg-[var(--bg)] text-[var(--text-main)] py-14 sm:py-20 border-b border-[var(--lead)] transition-colors duration-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <ServiceCategoryRail onSelectCategory={onSelectCategory} />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">

            <h2 className="font-display tracking-tight font-extrabold text-2xl sm:text-4xl text-[var(--text-main)]">
              Browse services
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-xl">
              Certified trade technicians dispatched across Nigeria, backed by escrow milestone protection.
            </p>
          </div>

          <Link
            href="/services"
            className="outlier-pill-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--lead)] bg-[var(--card-bg)] hover:border-[#F7803C] text-xs font-bold text-[var(--text-main)] shadow-sm transition-all"
          >
            <span>View all services</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F7803C]" />
          </Link>
        </div>

        {/* Outlier High-Curvature Feature Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat)}
              className="group overflow-hidden rounded-[20px] md:rounded-[24px] border border-[var(--lead)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] hover:border-[#F7803C]/50 text-left transition-all duration-200 hover:shadow-xl hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 flex flex-col justify-between"
            >
              <div className="relative aspect-[5/4] w-full overflow-hidden bg-[var(--tag-bg)]">
                <Image
                  src={cat.photoUrl}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-1 font-mono text-[11px] font-bold text-white shadow-sm">
                  From {cat.startingPrice}
                </span>
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#F7803C] text-[#0B0E13] opacity-0 group-hover:opacity-100 shadow-md transition-all duration-200 group-hover:translate-x-0 translate-x-1" aria-hidden="true">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="block text-sm sm:text-base font-bold leading-snug text-[var(--text-main)] group-hover:text-[#F7803C] transition-colors">
                    {cat.title}
                  </span>
                  <p className="mt-1.5 text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                    {cat.popularServices.slice(0, 2).join(' • ')}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-[var(--lead)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>Available in 7 cities</span>
                  <span className="text-[#2FE896] font-semibold">Instant Dispatch</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
