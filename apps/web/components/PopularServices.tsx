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
    <section id="services" className="bg-[#F8F9FF] py-16 border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ServiceCategoryRail onSelectCategory={onSelectCategory} />

        <div className="flex items-end justify-between gap-4 pt-1">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
            Browse services
          </h2>
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#296A4B] hover:text-[#1f5239] transition-colors"
          >
            View all services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat)}
              className="bbj-card-interactive service-card-motion motion-press group overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-left transition-[transform,box-shadow,border-color] duration-[180ms] ease-[var(--ease-ui-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-slate-100">
                <Image
                  src={cat.photoUrl}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="service-card-image object-cover transition-transform duration-[180ms] ease-[var(--ease-ui-out)]"
                />
                <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-slate-200/80 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#001A41] shadow-xs backdrop-blur-xs">
                  From {cat.startingPrice}
                </span>
                <span className="service-card-arrow absolute right-3 top-3 flex h-8 w-8 translate-x-1 items-center justify-center rounded-full bg-[#001A41] text-base text-white opacity-0 shadow-sm transition-[opacity,transform] duration-[180ms] ease-[var(--ease-ui-out)]" aria-hidden="true">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="p-4">
                <span className="block text-[15px] font-semibold leading-snug text-[#001A41] transition-colors group-hover:text-[#296A4B]">
                  {cat.title}
                </span>
                <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                  {cat.popularServices.slice(0, 2).join(', ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
