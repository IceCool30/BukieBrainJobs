'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SERVICE_CATEGORIES, ServiceCategory } from '../lib/mock/homepage-data';

interface PopularServicesProps {
  onSelectCategory?: (category: ServiceCategory) => void;
}

export default function PopularServices({ onSelectCategory }: PopularServicesProps) {
  return (
    <section id="services" className="bg-[#F8F9FF] py-16 sm:py-20">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
              Services for your home and work
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore services, compare starting estimates, and choose the right professional for the job.
            </p>
          </div>
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
              className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-left shadow-[0_2px_10px_-6px_rgba(0,26,65,0.18)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-[#296A4B]/45 hover:shadow-[0_16px_36px_-16px_rgba(0,26,65,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] focus-visible:ring-offset-2"
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-slate-100">
                <img
                  src={cat.photoUrl}
                  alt={cat.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.035]"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#001A41] shadow-sm">
                  From {cat.startingPrice}
                </span>
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#001A41] text-base text-white opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100" aria-hidden="true">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
              <div className="p-4">
                <span className="block text-[15px] font-semibold leading-snug text-[#001A41] transition-colors group-hover:text-[#296A4B]">
                  {cat.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
