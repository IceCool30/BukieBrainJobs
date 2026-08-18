import React from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { MOCK_TESTIMONIALS } from '../lib/mock/homepage-data';

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Booking feedback
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0B1C30]">
            Feedback that helps you choose
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Professional profiles bring together service details, booking history, and customer feedback.
          </p>
        </div>

        {/* Typographic review grid, no boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {MOCK_TESTIMONIALS.map((item) => (
            <article key={item.id} className="flex flex-col space-y-4">
              <div className="flex gap-1">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-base text-[#0B1C30] leading-relaxed">
                {item.quote}
              </p>
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-sm text-[#001A41]">
                  {item.author}
                </h3>
                <div className="text-xs font-medium text-slate-600">{item.role}, {item.location}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.service} booking</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="text-center text-xs font-medium text-slate-600 pt-2">
          Ratings and reviews are shown on professional profiles.
        </p>
      </div>
    </section>
  );
}
