'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { MOCK_FAQS } from '../lib/mock/homepage-data';

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(MOCK_FAQS[0]?.id ?? null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-12 sm:py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
            Questions before you book
          </h2>
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {MOCK_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] overflow-hidden transition-colors hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="motion-press flex min-h-12 w-full items-center justify-between gap-4 px-4 py-3.5 text-left font-display text-sm font-semibold text-[#001A41] transition-colors hover:text-[#001A41] sm:px-6 sm:py-4 sm:text-base"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-[160ms] ease-[var(--ease-ui-out)] ${
                      isOpen ? 'rotate-180 text-slate-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/50 px-4 pb-4 pt-1 text-xs leading-relaxed text-slate-600 sm:px-6 sm:pb-5 sm:text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
