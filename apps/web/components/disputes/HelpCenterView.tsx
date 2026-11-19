// apps/web/components/disputes/HelpCenterView.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 GREEN: Help Center View Component

'use client';

import React, { useState } from 'react';

export interface HelpCenterViewProps {
  searchQuery?: string;
  onSelectCategory?: (category: string) => void;
  className?: string;
}

interface SupportTopic {
  id: string;
  title: string;
  description: string;
  faqs: { question: string; answer: string }[];
}

const SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: 'billing-escrow',
    title: 'Billing & Escrow',
    description: 'Review how simulated milestone records model completion verification in this local preview.',
    faqs: [
      {
        question: 'When is simulated escrow marked released in this preview?',
        answer: 'In this local prototype, simulated completion records transition after customer inspection approval or upon 72-hour auto-release timeout when no dispute is open. Live banking and payment settlements remain reserved.',
      },
      {
        question: 'What fee splits are modeled in this prototype?',
        answer: 'The prototype models a 10% service fee and 7.5% trust fee on simulated records, allocating an 82.5% share to the BrainWorker. Real funds are not transferred.',
      },
    ],
  },
  {
    id: 'onsite-safety',
    title: 'On-Site Safety',
    description: 'Guidelines for safe on-site work and professional conduct.',
    faqs: [
      {
        question: 'What if an on-site safety issue occurs?',
        answer:
          'In an on-site emergency or safety situation, immediately pause work, ensure your safety, and contact local emergency authorities. This local preview does not dispatch support tickets or contact emergency services.',
      },
      {
        question: 'Are identity credentials verified before dispatch?',
        answer:
          'In this local prototype preview, worker verification badges reflect simulated sample data. This local preview does not verify identities or run background checks.',
      },
    ],
  },
  {
    id: 'disputes-mediation',
    title: 'Disputes & Mediation',
    description: 'Simulated dispute procedures when work is incomplete or quality is disputed in this workspace.',
    faqs: [
      {
        question: 'How does our dispute resolution process work?',
        answer:
          'In this local prototype, both Customer and BrainWorker record audit statements and evidence for manual review. This local preview stores dispute notes and evidence locally. It does not contact a platform mediator.',
      },
      {
        question: 'What happens to simulated timers during a dispute?',
        answer:
          'In this local prototype, simulated auto-release countdown timers are paused in local records. Real escrow custody and banking settlement are not active.',
      },
    ],
  },
  {
    id: 'scope-adjustments',
    title: 'Scope Adjustments',
    description: 'How unforeseen parts and cost changes are modeled in local records.',
    faqs: [
      {
        question: 'How are scope adjustments handled in this prototype?',
        answer: 'In this local prototype, BrainWorkers submit simulated extra parts and labor requests. These adjustments update local preview records after Customer approval and do not trigger live payment or escrow settlement.',
      },
    ],
  },
];

export function HelpCenterView({
  searchQuery = '',
  onSelectCategory,
  className = '',
}: HelpCenterViewProps): React.ReactElement {
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const query = internalQuery.toLowerCase().trim();

  const filteredTopics = SUPPORT_TOPICS.filter((topic) => {
    if (!query) return true;
    return (
      topic.title.toLowerCase().includes(query) ||
      topic.description.toLowerCase().includes(query) ||
      topic.faqs.some(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      )
    );
  });

  const toggleTopic = (topic: SupportTopic) => {
    const nextState = expandedTopicId === topic.id ? null : topic.id;
    setExpandedTopicId(nextState);
    if (onSelectCategory) {
      onSelectCategory(topic.title);
    }
  };

  return (
    <div
      data-testid="help-center-view"
      className={`flex flex-col gap-5 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 text-[var(--text-main)] shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--amber)]">
          Support Knowledge Base
        </span>
        <h2 className="text-lg font-bold text-[var(--text-main)]">
          Help Center and Frequently Asked Questions
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Browse local preview guidance on dispute workflows, simulated completion milestones, and prototype policies.
        </p>
      </div>

      <div>
        <label htmlFor="help-search-input" className="sr-only">
          Search help topics
        </label>
        <input
          id="help-search-input"
          type="search"
          value={internalQuery}
          onChange={(e) => setInternalQuery(e.target.value)}
          placeholder="Search by topic, keyword, or policy question..."
          className="min-h-[44px] w-full rounded-md border border-[var(--rule)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--amber)] focus:outline-none focus:ring-2 focus:ring-[var(--amber)]"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        {filteredTopics.map((topic) => {
          const isExpanded = expandedTopicId === topic.id;

          return (
            <div
              key={topic.id}
              className="overflow-hidden rounded-md border border-[var(--lead)] bg-[var(--bg)] transition"
            >
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => toggleTopic(topic)}
                className="flex min-h-[48px] w-full items-center justify-between p-3.5 text-left transition hover:bg-[var(--lead)]/30"
              >
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-main)]">
                    {topic.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                    {topic.description}
                  </p>
                </div>
                <span className="ml-3 text-xs text-[var(--text-muted)]">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t border-[var(--lead)] bg-[var(--card-bg)] p-3.5 text-xs">
                  <div className="flex flex-col gap-3">
                    {topic.faqs.map((faq, idx) => (
                      <div key={idx} className="flex flex-col gap-0.5">
                        <span className="font-semibold text-[var(--text-main)]">
                          {faq.question}
                        </span>
                        <p className="leading-relaxed text-[var(--text-muted)]">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredTopics.length === 0 && (
          <p className="py-6 text-center text-xs text-[var(--text-muted)]">
            No matching topics found for &quot;{internalQuery}&quot;. Please try another keyword.
          </p>
        )}
      </div>
    </div>
  );
}
