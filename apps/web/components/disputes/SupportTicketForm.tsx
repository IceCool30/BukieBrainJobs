// apps/web/components/disputes/SupportTicketForm.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 GREEN: Support Ticket Form Component

'use client';

import React, { useId, useState } from 'react';

export interface SupportTicketFormData {
  category: string;
  bookingId?: string | undefined;
  email: string;
  message: string;
}

export interface SupportTicketFormProps {
  onSubmit?: (data: SupportTicketFormData) => Promise<void> | void;
  isSubmitting?: boolean;
  initialBookingId?: string;
  className?: string;
}

const TICKET_CATEGORIES: string[] = [
  'Disputes & Mediation',
  'Billing & Escrow',
  'On-Site Safety',
  'Scope Adjustments',
  'Account & Verification',
  'Other',
];

export function SupportTicketForm({
  initialBookingId = '',
  className = '',
}: SupportTicketFormProps): React.ReactElement {
  const [category, setCategory] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>(initialBookingId);
  const [message, setMessage] = useState<string>('');

  const categoryId = useId();
  const emailId = useId();
  const bookingIdInputId = useId();
  const messageId = useId();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <form
      data-testid="support-ticket-form"
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 text-[var(--text-main)] shadow-sm ${className}`}
    >
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--amber)]">
          Support Assistance
        </span>
        <h2 className="text-lg font-bold text-[var(--text-main)]">
          Submit Support Ticket
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Need help with a booking, payment issue, or dispute? Direct inquiries and support routing remain reserved for future releases.
        </p>
      </div>

      <div
        role="status"
        className="rounded-md border border-[var(--rule)] bg-[var(--bg)] p-3 text-xs text-[var(--text-muted)]"
      >
        Ticket submission is currently unavailable in this local interface preview. Live support dispatch and ticket routing remain reserved for future releases.
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={categoryId}
          className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
        >
          Category / Topic
        </label>
        <select
          id={categoryId}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled
          className="min-h-[44px] w-full rounded-md border border-[var(--rule)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-[var(--amber)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select a topic...</option>
          {TICKET_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={emailId}
            className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
          >
            Email / Contact
          </label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
            placeholder="you@example.com"
            className="min-h-[44px] w-full rounded-md border border-[var(--rule)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--amber)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={bookingIdInputId}
            className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
          >
            Booking Reference (Optional)
          </label>
          <input
            id={bookingIdInputId}
            type="text"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            disabled
            placeholder="e.g. book-101"
            className="min-h-[44px] w-full font-mono rounded-md border border-[var(--rule)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--amber)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={messageId}
          className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
        >
          Message / Inquiry
        </label>
        <textarea
          id={messageId}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled
          placeholder="Explain your issue, questions, or request assistance..."
          className="w-full rounded-md border border-[var(--rule)] bg-[var(--bg)] p-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--amber)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex items-center justify-end pt-2 border-t border-[var(--lead)]">
        <button
          type="submit"
          disabled
          className="flex min-h-[44px] items-center justify-center rounded-md bg-[var(--amber)] px-5 text-xs font-semibold text-[var(--amber-text)] shadow-sm transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit Ticket
        </button>
      </div>
    </form>
  );
}
