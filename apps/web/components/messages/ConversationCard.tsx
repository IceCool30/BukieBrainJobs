'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { ConversationSummary } from '../../lib/messaging/types';

export interface ConversationCardProps {
  conversation: ConversationSummary;
  isActive?: boolean | undefined;
  currentUserId?: string | undefined;
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

function getSenderPrefix(
  senderId: string,
  currentUserId?: string,
  senderName?: string
): string {
  if (currentUserId && senderId === currentUserId) {
    return 'You: ';
  }
  if (!senderName) return '';
  const cleanName = senderName
    .replace(/^(Engr\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '')
    .trim();
  const firstName = cleanName.split(/\s+/)[0] || senderName;
  return `${firstName}: `;
}

function formatRelativeTimestamp(isoDate: string, now: number = Date.now()): string {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) return '';

  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Just now';
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  if (diffHour < 24) {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDay === 1) {
    return 'Yesterday';
  }
  if (diffDay < 7) {
    return `${diffDay}d ago`;
  }

  const d = new Date(timestamp);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function ConversationCard({
  conversation,
  isActive = false,
  currentUserId,
}: ConversationCardProps) {
  const {
    referenceCode,
    serviceTitle,
    participant,
    lastMessage,
    unreadCount,
    lastMessageAt,
  } = conversation;

  const formattedTime = formatRelativeTimestamp(lastMessageAt);

  return (
    <article
      role="article"
      className={`group relative flex items-start gap-3.5 p-4 rounded-2xl border transition-all ${
        isActive
          ? 'bg-[var(--card-hover)] border-[var(--amber)] shadow-xs'
          : 'bg-[var(--card-bg)] border-[var(--lead)] hover:border-[var(--amber)] hover:bg-[var(--card-hover)] shadow-xs'
      }`}
    >
      {/* Avatar Container with Verification Badge */}
      <div className="relative flex-shrink-0">
        {participant.avatarUrl ? (
          <img
            src={participant.avatarUrl}
            alt={participant.name}
            className="w-12 h-12 rounded-full object-cover border border-[var(--lead)]"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full bg-[var(--tag-bg)] border border-[var(--lead)] text-[var(--text-main)] font-bold text-sm flex items-center justify-center select-none"
            aria-hidden="true"
          >
            {getInitials(participant.name)}
          </div>
        )}

        {participant.isVerified && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--brand-green)] text-white flex items-center justify-center ring-2 ring-[var(--card-bg)]"
            aria-label="Verified BrainWorker"
            title="Verified BrainWorker"
          >
            <ShieldCheck className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* Main Content Details */}
      <div className="flex-1 min-w-0">
        {/* Row 1: Participant Name + Relative Timestamp */}
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-[var(--text-main)] truncate">
            {participant.name}
          </h2>
          {formattedTime && (
            <time
              dateTime={lastMessageAt}
              className="text-[11px] font-medium text-[var(--text-muted)] flex-shrink-0"
            >
              {formattedTime}
            </time>
          )}
        </div>

        {/* Row 2: Service Title + Reference Code */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-0.5 truncate">
          <span className="truncate font-medium text-[var(--text-main)]">
            {serviceTitle}
          </span>
          <span aria-hidden="true" className="text-[var(--rule)]">
            •
          </span>
          <span className="font-mono text-[11px] text-[var(--text-muted)] flex-shrink-0">
            {referenceCode}
          </span>
        </div>

        {/* Row 3: Latest Message Snippet & Unread Badge */}
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <p className="text-xs text-[var(--text-muted)] truncate flex-1">
            {lastMessage ? (
              `${getSenderPrefix(
                lastMessage.senderId,
                currentUserId,
                lastMessage.senderName
              )}${lastMessage.content}`
            ) : (
              <span className="italic text-[var(--text-muted)]">No messages yet</span>
            )}
          </p>

          {unreadCount > 0 && (
            <span
              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-[#296A4B] text-white text-[11px] font-bold min-w-[20px] leading-tight flex-shrink-0 shadow-xs"
              aria-label={`${unreadCount} unread messages`}
            >
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
