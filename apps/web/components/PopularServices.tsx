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
    <section id="services" className="py-16 bg-white border-b border-slate-200">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat)}
              className="group bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] hover:border-[#296A4B] hover:shadow-[0_12px_32px_-12px_rgba(0,26,65,0.18)] hover:-translate-y-1 transition-all overflow-hidden text-left"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={cat.photoUrl}
                  alt={cat.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-2 left-3 text-[11px] font-semibold text-white drop-shadow">
                  Estimated from {cat.startingPrice}
                </span>
              </div>
              <div className="p-3.5 pt-3">
                <span className="text-sm font-semibold text-[#001A41] group-hover:text-[#296A4B] transition-colors leading-tight block">
                  {cat.title}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 line-clamp-1 block">
                  Explore available options
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
