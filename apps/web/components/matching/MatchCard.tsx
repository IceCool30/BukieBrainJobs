'use client';

import React from 'react';
import {
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import type { MatchCandidate, MatchExplanationTag } from '@bukiebrainjobs/types';
import { getExplanationLabel } from '../../lib/matching/explanations';

// ─── Match explanation chip ────────────────────────────────────────────────────

function ExplanationChip({ tag }: { tag: MatchExplanationTag }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#abeec8]/30 border border-[#abeec8] text-[#075135] text-[11px] font-medium leading-snug">
      <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
      {getExplanationLabel(tag)}
    </span>
  );
}

// ─── Avatar ────────────────────────────────────────────────────────────────────

function CandidateAvatar({
  displayName,
  avatarUrl,
}: {
  displayName: string;
  avatarUrl?: string;
}) {
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (avatarUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={avatarUrl}
        alt={`${displayName} profile photo`}
        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className="w-14 h-14 rounded-full bg-[#001A41] text-white flex items-center justify-center text-lg font-bold shrink-0 select-none"
      aria-label={`${displayName} profile avatar`}
    >
      {initials}
    </div>
  );
}

// ─── Rating display ────────────────────────────────────────────────────────────

function RatingDisplay({
  rating,
  completedJobCount,
}: {
  rating?: number;
  completedJobCount?: number;
}) {
  if (rating === undefined && completedJobCount === undefined) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-600">
      {rating !== undefined && (
        <span className="flex items-center gap-0.5 font-semibold text-amber-600">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span>{rating.toFixed(1)}</span>
        </span>
      )}
      {completedJobCount !== undefined && (
        <span className="text-slate-400">
          {rating !== undefined && '·'} {completedJobCount} jobs completed
        </span>
      )}
    </div>
  );
}

// ─── Main match card ───────────────────────────────────────────────────────────

interface MatchCardProps {
  candidate: MatchCandidate;
  onSelect: (candidateId: string) => void;
  onViewProfile: (brainWorkerId: string) => void;
  isProcessing?: boolean;
}

export function MatchCard({
  candidate,
  onSelect,
  onViewProfile,
  isProcessing = false,
}: MatchCardProps) {
  const { profile, explanations, selectionState, rank } = candidate;
  const isInterested = selectionState === 'interest_expressed';
  const isPending = selectionState === 'pending' || isProcessing;

  const selectLabel = isInterested ? 'Withdraw interest' : 'Express interest';
  const selectAriaLabel = `${selectLabel}: ${profile.displayName}`;

  return (
    <article
      aria-label={`Match ${rank}: ${profile.displayName}`}
      className={`bg-white border rounded-2xl p-5 transition-shadow ${
        isInterested
          ? 'border-[#001A41] ring-1 ring-[#001A41] shadow-sm'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Rank badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <CandidateAvatar
            displayName={profile.displayName}
            {...(profile.avatarUrl !== undefined ? { avatarUrl: profile.avatarUrl } : {})}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-[#001A41] text-base leading-snug">
                {profile.displayName}
              </h3>
              {profile.identityVerified && (
                <span
                  className="inline-flex items-center gap-0.5 text-[#075135] bg-[#abeec8]/30 border border-[#abeec8] rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                  aria-label="Identity verified"
                >
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  Verified
                </span>
              )}
            </div>
            <RatingDisplay
              {...(profile.publicRating !== undefined ? { rating: profile.publicRating } : {})}
              {...(profile.completedJobCount !== undefined ? { completedJobCount: profile.completedJobCount } : {})}
            />
          </div>
        </div>
        <span
          className="shrink-0 text-[11px] font-mono text-slate-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5"
          aria-label={`Ranked ${rank}`}
        >
          #{rank}
        </span>
      </div>

      {/* Meta info */}
      <dl className="space-y-1.5 text-xs text-slate-600 mb-4">
        {profile.servicesLabel && (
          <div className="flex items-start gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <dd>{profile.servicesLabel}</dd>
          </div>
        )}
        {profile.serviceAreaLabel && (
          <div className="flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <dd>{profile.serviceAreaLabel}</dd>
          </div>
        )}
        {profile.availabilityLabel && (
          <div className="flex items-start gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <dd>{profile.availabilityLabel}</dd>
          </div>
        )}
        {profile.rateLabel && (
          <div className="flex items-start gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
            <dd>{profile.rateLabel}</dd>
          </div>
        )}
      </dl>

      {/* Why this matches */}
      {explanations && explanations.length > 0 && (
        <section aria-label="Why this BrainWorker matches" className="mb-4">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Why this matches
          </p>
          <div className="flex flex-wrap gap-1.5" role="list">
            {explanations.map((tag) => (
              <div key={tag} role="listitem">
                <ExplanationChip tag={tag} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Selection state notice */}
      {isInterested && (
        <p
          role="status"
          aria-live="polite"
          className="text-xs text-[#075135] bg-[#abeec8]/20 border border-[#abeec8] rounded-xl px-3 py-2 mb-3"
        >
          Your interest has been noted. This is not a booking or an acceptance.
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onViewProfile(profile.brainWorkerId)}
          className="flex-1 text-center text-sm font-medium text-[#001A41] border border-slate-200 rounded-xl py-2 px-3 hover:bg-slate-50 hover:border-slate-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
          aria-label={`View profile of ${profile.displayName}`}
        >
          View profile
        </button>
        <button
          type="button"
          onClick={() => onSelect(candidate.candidateId)}
          disabled={isPending}
          aria-label={selectAriaLabel}
          aria-pressed={isInterested}
          className={`flex-1 text-center text-sm font-semibold rounded-xl py-2 px-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] disabled:opacity-60 disabled:cursor-not-allowed ${
            isInterested
              ? 'bg-white border border-[#001A41] text-[#001A41] hover:bg-slate-50'
              : 'bg-[#001A41] text-white hover:bg-[#002661]'
          }`}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-1.5" aria-label="Processing">
              <span
                className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
                aria-hidden="true"
              />
              Processing...
            </span>
          ) : isInterested ? (
            'Withdraw interest'
          ) : (
            'Express interest'
          )}
        </button>
      </div>
    </article>
  );
}
