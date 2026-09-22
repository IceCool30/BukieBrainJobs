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
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-[#001A41] placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#001A41] focus:ring-1 focus:ring-[#001A41] transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div
        role="tablist"
        aria-label="Conversation filters"
        className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60"
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
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] ${
                isSelected
                  ? 'bg-white text-[#001A41] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
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
