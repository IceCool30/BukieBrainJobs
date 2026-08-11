'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { MOCK_FAQS } from '../lib/mock/homepage-data';

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(MOCK_FAQS[0]?.id ?? null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faqs" className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#296A4B] uppercase tracking-wider bg-[#EEFBF3] px-3 py-1 rounded-full border border-[#ABEEC8]">
            Frequently Asked Questions
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[#001A41] mt-3">
            Everything You Need to Know
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Clear answers about BukiePassport, Escrow protection, BukieGuarantee, and artisan payouts.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {MOCK_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-[#F8F9FF] rounded-2xl border border-slate-200/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between font-display font-bold text-sm sm:text-base text-[#001A41] hover:text-[#296A4B] focus:outline-none focus:ring-2 focus:ring-[#296A4B] transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-[#296A4B] flex-shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#296A4B]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                  >
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
