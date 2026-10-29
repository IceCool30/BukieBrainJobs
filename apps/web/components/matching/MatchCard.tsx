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
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--brand-green-dim)] border border-[var(--brand-green)] text-[var(--brand-green)] text-xs font-mono font-medium leading-snug">
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
        className="w-14 h-14 rounded-xl object-cover border border-[var(--lead)] shadow-xs shrink-0"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className="w-14 h-14 rounded-xl bg-[var(--tag-bg)] border border-[var(--lead)] text-[var(--text)] flex items-center justify-center text-lg font-bold font-mono shrink-0 select-none"
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
    <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
      {rating !== undefined && (
        <span className="flex items-center gap-0.5 font-semibold text-[var(--amber)]">
          <Star className="h-3.5 w-3.5 fill-[var(--amber)] text-[var(--amber)]" aria-hidden="true" />
          <span className="font-mono">{rating.toFixed(1)}</span>
        </span>
      )}
      {completedJobCount !== undefined && (
        <span className="text-[var(--muted)]">
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
      className={`bg-[var(--card-bg)] border rounded-2xl p-5 transition-shadow shadow-xs ${
        isInterested
          ? 'border-[var(--brand-green)] ring-1 ring-[var(--brand-green)]'
          : 'border-[var(--lead)] hover:border-[var(--muted)]'
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
              <h3 className="font-bold text-[var(--text)] text-base leading-snug">
                {profile.displayName}
              </h3>
              {profile.identityVerified && (
                <span
                  className="inline-flex items-center gap-0.5 text-[var(--brand-green)] bg-[var(--brand-green-dim)] border border-[var(--brand-green)] rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
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
          className="shrink-0 text-[11px] font-mono text-[var(--muted)] bg-[var(--tag-bg)] border border-[var(--lead)] rounded-full px-2.5 py-0.5"
          aria-label={`Ranked ${rank}`}
        >
          #{rank}
        </span>
      </div>

      {/* Meta info */}
      <dl className="space-y-1.5 text-xs text-[var(--muted)] mb-4">
        {profile.servicesLabel && (
          <div className="flex items-start gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-[var(--muted)] shrink-0 mt-0.5" aria-hidden="true" />
            <dd className="text-[var(--text)]">{profile.servicesLabel}</dd>
          </div>
        )}
        {profile.serviceAreaLabel && (
          <div className="flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[var(--muted)] shrink-0 mt-0.5" aria-hidden="true" />
            <dd className="text-[var(--text)]">{profile.serviceAreaLabel}</dd>
          </div>
        )}
        {profile.availabilityLabel && (
          <div className="flex items-start gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[var(--muted)] shrink-0 mt-0.5" aria-hidden="true" />
            <dd className="text-[var(--text)]">{profile.availabilityLabel}</dd>
          </div>
        )}
        {profile.rateLabel && (
          <div className="flex items-start gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-[var(--muted)] shrink-0 mt-0.5" aria-hidden="true" />
            <dd className="font-mono text-[var(--brand-green)] font-semibold">{profile.rateLabel}</dd>
          </div>
        )}
      </dl>

      {/* Why this matches */}
      {explanations && explanations.length > 0 && (
        <section aria-label="Why this BrainWorker matches" className="mb-4">
          <p className="text-[11px] font-mono font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
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
          className="text-xs text-[var(--brand-green)] bg-[var(--brand-green-dim)] border border-[var(--brand-green)] rounded-xl px-3 py-2 mb-3"
        >
          Your interest has been noted. This is not a booking or an acceptance.
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-[var(--lead)]">
        <button
          type="button"
          onClick={() => onViewProfile(profile.brainWorkerId)}
          className="flex-1 text-center text-xs font-semibold text-[var(--text)] border border-[var(--lead)] rounded-full py-2.5 px-4 hover:bg-[var(--tag-bg)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
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
          className={`flex-1 text-center text-xs font-bold rounded-full py-2.5 px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:opacity-60 disabled:cursor-not-allowed ${
            isInterested
              ? 'bg-[var(--card-bg)] border border-[var(--lead)] text-[var(--text)] hover:bg-[var(--tag-bg)]'
              : 'outlier-pill-button bg-[var(--amber)] text-[#001A41] hover:bg-[var(--amber-hover)] shadow-xs'
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
