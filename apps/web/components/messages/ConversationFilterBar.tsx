'use client';

import React from 'react';
import { Search } from 'lucide-react';

export type ConversationFilterTab = 'all' | 'active' | 'archived';

export interface ConversationFilterBarProps {
  activeTab: ConversationFilterTab;
  onTabChange: (tab: ConversationFilterTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const TABS: { id: ConversationFilterTab; label: string }[] = [
  { id: 'all', label: 'All Messages' },
  { id: 'active', label: 'Active Jobs' },
  { id: 'archived', label: 'Archived' },
];

export function ConversationFilterBar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: ConversationFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Search Input Box */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:bg-[var(--card-bg)] focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div
        role="tablist"
        aria-label="Conversation filters"
        className="flex items-center gap-1.5 p-1 bg-[var(--tag-bg)] rounded-xl border border-[var(--lead)]"
      >
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-controls={`tabpanel-${tab.id}`}
              aria-selected={isSelected}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] cursor-pointer ${
                isSelected
                  ? 'bg-[var(--card-bg)] text-[var(--amber)] shadow-xs font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
