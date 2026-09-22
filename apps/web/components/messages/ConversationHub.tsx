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
  conversations?: ConversationSummary[];
  activeJobId?: string;
  onSelectConversation?: (jobId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  currentUserId?: string;
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
        <h1 className="text-2xl font-bold font-display text-[#001A41]">
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
          className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span className="truncate">{error}</span>
          </div>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1 rounded-lg bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors flex-shrink-0"
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
              className="flex items-start gap-3.5 p-4 rounded-2xl border border-slate-200 bg-white animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-200 rounded w-12" />
                </div>
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            </div>
          ))}
          <span className="sr-only">Loading conversations...</span>
        </div>
      ) : conversations.length === 0 ? (
        /* First-Run Empty State */
        <div className="py-12 px-6 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-xs my-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-display text-[#001A41]">
              No active conversations yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              When you book a service or message a BrainWorker, your
              conversations will appear here.
            </p>
          </div>
          <div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#001A41] text-white text-xs sm:text-sm font-semibold hover:bg-[#002661] transition-colors shadow-xs"
            >
              Browse Services
            </Link>
          </div>
        </div>
      ) : searchQuery.trim() !== '' && filteredConversations.length === 0 ? (
        /* Zero Search Results State */
        <div className="py-12 px-4 text-center text-sm text-slate-500 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <p className="font-medium text-slate-600">
            No conversations match your search.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try searching for a different BrainWorker name or service title.
          </p>
        </div>
      ) : filteredConversations.length === 0 ? (
        /* Zero Filter Results State */
        <div className="py-12 px-4 text-center text-sm text-slate-500 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <p className="font-medium text-slate-600">
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
            <ConversationCard
              key={conversation.jobId}
              conversation={conversation}
              isActive={activeJobId === conversation.jobId}
              currentUserId={currentUserId}
              onSelect={onSelectConversation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
