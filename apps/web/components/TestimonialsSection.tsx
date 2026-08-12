import React from 'react';
import { Star, CheckCircle2, MapPin } from 'lucide-react';
import { MOCK_TESTIMONIALS } from '../lib/mock/homepage-data';

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="text-xs font-bold text-[#296A4B] uppercase tracking-wider">
            Verified Customer Stories
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0B1C30]">
            Trusted by Nigerian Homeowners &amp; Businesses
          </h2>
        </div>

        {/* 3 Story Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E6E4F] bg-[#ABEEC8]/30 px-2 py-0.5 rounded-full border border-[#296A4B]/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Booking
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs text-[#0B1C30]">
                    {item.author}
                  </h4>
                  <div className="text-[11px] text-slate-500">{item.role}</div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#296A4B]" />
                    <span>{item.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
