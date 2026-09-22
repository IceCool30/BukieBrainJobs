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
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        {/* Back link - visible on mobile, optional on desktop */}
        <Link
          href={`/jobs?id=${jobId}`}
          className="flex items-center gap-2 text-sm font-medium text-[#001A41] hover:text-[#296A4B] transition-colors flex-shrink-0"
          aria-label={`Back to booking ${referenceCode}`}
        >
          <span className="text-lg">&#8592;</span>
          <span className="hidden sm:inline">Back to Booking</span>
        </Link>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {participantAvatar ? (
            <img
              src={participantAvatar}
              alt={`Worker ${participantName}`}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center select-none"
              aria-hidden="true"
            >
              {getInitials(participantName)}
            </div>
          )}
          {participantIsVerified && (
            <span
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#296A4B] text-white flex items-center justify-center ring-2 ring-white"
              aria-label="Verified BrainWorker"
              title="Verified BrainWorker"
            >
              <ShieldCheck className="w-2 h-2" />
            </span>
          )}
        </div>

        {/* Name and Details */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-[#001A41] truncate">{participantName}</h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
            <span className="truncate font-medium text-slate-600">{serviceTitle}</span>
            <span aria-hidden="true" className="text-slate-300">
              •
            </span>
            <Link
              href={`/jobs?id=${jobId}`}
              className="font-mono text-[11px] text-[#001A41] hover:text-[#296A4B] flex-shrink-0"
            >
              {referenceCode}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
