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
    <section id="faq" className="py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="text-xs font-bold text-[#296A4B] uppercase tracking-wider">
            Clear Answers
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0B1C30]">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {MOCK_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-display font-semibold text-sm sm:text-base text-[#0B1C30] hover:text-[#296A4B] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#296A4B] shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#296A4B]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
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
