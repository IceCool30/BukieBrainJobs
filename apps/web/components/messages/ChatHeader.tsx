'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export interface ChatHeaderProps {
  participantName: string;
  participantAvatar?: string | undefined;
  participantIsVerified: boolean;
  referenceCode: string;
  jobId: string;
  serviceTitle: string;
}

function getInitials(name: string): string {
  return name
    .replace(/^(Engr\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ChatHeader({
  participantName,
  participantAvatar,
  participantIsVerified,
  referenceCode,
  jobId,
  serviceTitle,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[var(--card-bg)] border-b border-[var(--lead)] px-4 py-3 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        {/* Back link - visible on mobile, optional on desktop */}
        <Link
          href="/messages"
          className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--amber)] transition-colors flex-shrink-0"
          aria-label="Back to messages"
        >
          <span className="text-lg leading-none">&#8592;</span>
          <span className="hidden sm:inline">Back to Messages</span>
        </Link>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {participantAvatar ? (
            <img
              src={participantAvatar}
              alt={`Worker ${participantName}`}
              className="w-10 h-10 rounded-lg object-cover border border-[var(--lead)]"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg bg-[var(--tag-bg)] border border-[var(--lead)] text-[var(--text-main)] font-bold text-sm flex items-center justify-center select-none"
              aria-hidden="true"
            >
              {getInitials(participantName)}
            </div>
          )}
          {participantIsVerified && (
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-md bg-[var(--brand-green)] text-white flex items-center justify-center ring-2 ring-[var(--card-bg)]"
              aria-label="Verified BrainWorker"
              title="Verified BrainWorker"
            >
              <ShieldCheck className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        {/* Name and Details */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold font-display text-[var(--text-main)] truncate">{participantName}</h1>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-0.5 truncate">
            <span className="truncate font-medium text-[var(--text-muted)]">{serviceTitle}</span>
            <span aria-hidden="true" className="text-[var(--rule)]">
              •
            </span>
            <Link
              href={`/jobs?id=${jobId}`}
              className="font-mono text-[11px] text-[var(--amber)] hover:underline flex-shrink-0"
            >
              {referenceCode}
            </Link>
          </div>
        </div>

      </div>
    </header>
  );
}
