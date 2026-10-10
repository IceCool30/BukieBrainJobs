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
    <section
      id="services"
      className="bg-[var(--bg)] text-[var(--text-main)] py-12 sm:py-16 border-b border-[var(--lead)] transition-colors duration-200"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <ServiceCategoryRail onSelectCategory={onSelectCategory} />

        <div className="flex items-end justify-between gap-4 pt-1">
          <h2 className="font-display tracking-trades font-bold text-2xl sm:text-3xl text-[var(--text-main)]">
            Browse services
          </h2>
          <Link
            href="/services"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand-green)] hover:underline transition-colors"
          >
            View all services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory?.(cat)}
              aria-label={`Explore ${cat.title}`}
              className="group relative rounded-[28px] p-2.5 sm:p-3 border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl shadow-[0_10px_30px_rgba(0,26,65,0.05)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] hover:shadow-xl hover:border-[var(--amber)]/70 transition-all duration-200 text-left flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] active:scale-[0.98]"
            >
              <div className="rounded-[20px] overflow-hidden bg-[#F8F9FC] dark:bg-[#13171F] border border-black/[0.03] dark:border-white/[0.04] p-2 sm:p-2.5 flex flex-col justify-between h-full w-full">
                <div>
                  {/* Floating Inset Photo with Glass Price Tag */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-slate-200/60 dark:bg-zinc-800">
                    <Image
                      src={cat.photoUrl}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    {/* Glass Price Tag */}
                    <span className="absolute bottom-2 left-2 inline-flex items-center rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20 shadow-sm">
                      From {cat.startingPrice}
                    </span>
                    {/* Hover Arrow Icon */}
                    <span
                      aria-hidden="true"
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 dark:bg-black/60 text-[var(--text-main)] dark:text-white backdrop-blur-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  {/* Title & Category Info */}
                  <div className="mt-2.5 px-0.5">
                    <span className="block text-sm sm:text-[15px] font-bold leading-snug text-[var(--text-main)] transition-colors group-hover:text-[var(--amber)] line-clamp-1">
                      {cat.title}
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {cat.popularServices.slice(0, 2).map((service, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded-md bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.04] dark:border-white/[0.06] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)] font-medium truncate max-w-[120px]"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Hint */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.05] px-0.5">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[var(--brand-green)]">
                    Verified Hands
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-main)] group-hover:text-[var(--amber)] transition-colors">
                    Explore <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
