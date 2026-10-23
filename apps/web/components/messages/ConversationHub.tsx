'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MessageSquare, AlertCircle } from 'lucide-react';
import type { ConversationSummary } from '../../lib/messaging/types';
import { ConversationCard } from './ConversationCard';
import {
  ConversationFilterBar,
  type ConversationFilterTab,
} from './ConversationFilterBar';

export interface ConversationHubProps {
  conversations?: ConversationSummary[] | undefined;
  activeJobId?: string | undefined;
  onSelectConversation?: ((jobId: string) => void) | undefined;
  isLoading?: boolean | undefined;
  error?: string | null | undefined;
  onRetry?: (() => void) | undefined;
  currentUserId?: string | undefined;
}

export function ConversationHub({
  conversations = [],
  activeJobId,
  onSelectConversation,
  isLoading = false,
  error = null,
  onRetry,
  currentUserId,
}: ConversationHubProps) {
  const [activeTab, setActiveTab] = useState<ConversationFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Strict descending sort by lastMessageAt
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (b.lastMessageAt > a.lastMessageAt) return 1;
      if (b.lastMessageAt < a.lastMessageAt) return -1;
      return 0;
    });
  }, [conversations]);

  // Tab & search filtering
  const filteredConversations = useMemo(() => {
    return sortedConversations.filter((conv) => {
      // Lifecycle tab filtering
      if (activeTab === 'active' && conv.isReadOnly) {
        return false;
      }
      if (activeTab === 'archived' && !conv.isReadOnly) {
        return false;
      }

      // Real-time search query matching
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = conv.participant.name.toLowerCase().includes(query);
        const matchesService = conv.serviceTitle.toLowerCase().includes(query);
        if (!matchesName && !matchesService) {
          return false;
        }
      }

      return true;
    });
  }, [sortedConversations, activeTab, searchQuery]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-[var(--text-main)] tracking-tight">
          Messages
        </h1>
      </div>

      {/* Filter and Search Controls (shown when there are conversations or search active) */}
      {(conversations.length > 0 || searchQuery !== '') && (
        <ConversationFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Error State Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-dim)] text-[var(--danger)] text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-[var(--danger)]" />
            <span className="truncate font-medium">{error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1 rounded-md bg-[var(--danger)] hover:opacity-90 text-white font-semibold text-xs transition-colors flex-shrink-0 cursor-pointer"
            >
              Try again
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton View */}
      {isLoading ? (
        <div
          role="status"
          aria-busy="true"
          aria-label="Loading conversations..."
          className="space-y-3"
        >
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-4 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] animate-pulse"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--tag-bg)] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-[var(--tag-bg)] rounded w-1/3" />
                  <div className="h-3 bg-[var(--tag-bg)] rounded w-12" />
                </div>
                <div className="h-3 bg-[var(--tag-bg)] rounded w-1/2" />
                <div className="h-3 bg-[var(--tag-bg)] rounded w-3/4" />
              </div>
            </div>
          ))}
          <span className="sr-only">Loading conversations...</span>
        </div>
      ) : conversations.length === 0 ? (
        /* First-Run Empty State */
        <div className="py-12 px-6 text-center space-y-4 bg-[var(--card-bg)] rounded-lg border border-[var(--lead)] shadow-xs my-auto">
          <div className="w-12 h-12 rounded-lg bg-[var(--tag-bg)] border border-[var(--lead)] flex items-center justify-center mx-auto text-[var(--amber)]">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-[var(--text-main)]">
              No active conversations yet
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mx-auto">
              When you book a service or message a BrainWorker, your
              conversations will appear here.
            </p>
          </div>
          <div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-[#001A41] text-xs sm:text-sm font-bold transition-colors shadow-xs"
            >
              Browse Services
            </Link>
          </div>
        </div>
      ) : searchQuery.trim() !== '' && filteredConversations.length === 0 ? (
        /* Zero Search Results State */
        <div className="py-12 px-4 text-center text-sm text-[var(--text-muted)] bg-[var(--card-bg)] rounded-lg border border-dashed border-[var(--rule)]">
          <p className="font-semibold text-[var(--text-main)]">
            No conversations match your search.
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Try searching for a different BrainWorker name or service title.
          </p>
        </div>
      ) : filteredConversations.length === 0 ? (
        /* Zero Filter Results State */
        <div className="py-12 px-4 text-center text-sm text-[var(--text-muted)] bg-[var(--card-bg)] rounded-lg border border-dashed border-[var(--rule)]">
          <p className="font-semibold text-[var(--text-main)]">
            {activeTab === 'archived'
              ? 'No archived conversations.'
              : 'No active jobs found.'}
          </p>
        </div>
      ) : (
        /* Conversation Feed List */
        <div
          role="feed"
          aria-label="Conversations"
          className="space-y-2.5 overflow-y-auto flex-1 pr-0.5"
        >
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.jobId}
              href={`/messages/${conversation.jobId}`}
              aria-current={activeJobId === conversation.jobId ? 'page' : undefined}
              onClick={(event) => {
                if (
                  !onSelectConversation ||
                  event.button !== 0 ||
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey
                ) return;
                event.preventDefault();
                onSelectConversation(conversation.jobId);
              }}
              className="block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
            >
              <ConversationCard
                conversation={conversation}
                isActive={activeJobId === conversation.jobId}
                currentUserId={currentUserId}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
