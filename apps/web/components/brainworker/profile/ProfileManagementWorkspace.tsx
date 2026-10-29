// apps/web/components/brainworker/profile/ProfileManagementWorkspace.tsx
// BrainWorker Profile Management Workspace Component (BW-005, Item 2.7)
// Phase 3 GREEN: Master workspace tabbed switcher with strict financial decoupling

import React, { useState, type JSX } from 'react';
import { PortfolioGalleryManager } from './PortfolioGalleryManager';
import { ProfileEditorForm } from './ProfileEditorForm';
import { ReviewsCounterResponseTab } from './ReviewsCounterResponseTab';
import type { ProfileManagementWorkspaceProps } from './types';

type ActiveTab = 'profile' | 'portfolio' | 'reviews';

export function ProfileManagementWorkspace({
  profile,
  portfolioItems,
  reviews,
  isSaving,
  onSaveProfile,
  onAddPortfolioItem,
  onDeletePortfolioItem,
  onSubmitCounterResponse,
}: ProfileManagementWorkspaceProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

  return (
    <div className="space-y-6">
      {/* Top Workspace Navigation Tabs */}
      <div className="flex border border-[var(--lead)] bg-[var(--card-bg)] p-1.5 rounded-full shadow-sm">
        <button
          type="button"
          data-testid="tab-profile-details"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-[var(--text-main)] text-[var(--bg)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          Profile Details
        </button>
        <button
          type="button"
          data-testid="tab-portfolio-gallery"
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all ${
            activeTab === 'portfolio'
              ? 'bg-[var(--text-main)] text-[var(--bg)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          Portfolio Gallery ({portfolioItems.length})
        </button>
        <button
          type="button"
          data-testid="tab-client-reviews"
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all ${
            activeTab === 'reviews'
              ? 'bg-[var(--text-main)] text-[var(--bg)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          Client Reviews ({reviews.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-6 shadow-sm">
        {activeTab === 'profile' && (
          <ProfileEditorForm
            profile={profile}
            portfolioItems={portfolioItems}
            isSaving={isSaving}
            onSaveProfile={onSaveProfile ?? (async () => {})}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioGalleryManager
            portfolioItems={portfolioItems}
            onAddPortfolioItem={onAddPortfolioItem}
            onDeletePortfolioItem={onDeletePortfolioItem}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsCounterResponseTab
            reviews={reviews}
            onSubmitCounterResponse={onSubmitCounterResponse}
          />
        )}
      </div>
    </div>
  );
}
