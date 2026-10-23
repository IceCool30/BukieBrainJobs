'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { MOCK_FAQS } from '../lib/mock/homepage-data';

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(MOCK_FAQS[0]?.id ?? null);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-14 sm:py-20 bg-[var(--bg)] text-[var(--text-main)] border-b border-[var(--lead)] transition-colors duration-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--lead)] bg-[var(--tag-bg)] px-3 py-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F7803C]" />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              Support & Transparency
            </span>
          </div>
          <h2 className="font-display tracking-tight font-extrabold text-2xl sm:text-4xl text-[var(--text-main)]">
            Common questions
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Everything you need to know about artisan vetting, escrow payments, and the BukieGuarantee.
          </p>
        </div>

        {/* Accordion List with Outlier Curvature */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {MOCK_FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-[18px] md:rounded-[22px] border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#F7803C]/60 bg-[var(--card-bg)] shadow-md'
                    : 'border-[var(--lead)] bg-[var(--card-bg)] hover:border-[var(--rule)] hover:bg-[var(--card-hover)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-sm sm:text-base font-bold text-[var(--text-main)] transition-colors hover:text-[#F7803C] cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className={`w-4 h-4 shrink-0 ${isOpen ? 'text-[#F7803C]' : 'text-[var(--text-muted)]'}`} />
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#F7803C]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-[var(--lead)] bg-[var(--tag-bg)]/50 px-5 pb-5 pt-3 text-xs sm:text-sm leading-relaxed text-[var(--text-muted)]">
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
