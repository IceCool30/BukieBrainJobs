// apps/web/components/brainworker/profile/PortfolioGalleryManager.tsx
// BrainWorker Portfolio Gallery Manager Component (BW-005, Item 2.7)
// Phase 3 GREEN: Portfolio grid, before/after toggle, cap indicator, add & delete modals

import React, { useState, type JSX } from 'react';
import { MAX_PORTFOLIO_ITEMS, type PortfolioItem } from '../../../lib/brainworker/profile/types';
import type { PortfolioGalleryManagerProps } from './types';

export function PortfolioGalleryManager({
  portfolioItems,
  onAddPortfolioItem,
  onDeletePortfolioItem,
}: PortfolioGalleryManagerProps): JSX.Element {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [activeImageToggles, setActiveImageToggles] = useState<Record<string, 'before' | 'after'>>({});

  // New item form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [beforeImageUrl, setBeforeImageUrl] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isCapped = portfolioItems.length >= MAX_PORTFOLIO_ITEMS;

  const toggleBeforeAfter = (itemId: string) => {
    setActiveImageToggles((prev) => ({
      ...prev,
      [itemId]: prev[itemId] === 'before' ? 'after' : 'before',
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || !category.trim() || !afterImageUrl.trim()) {
      setFormError('Title, trade category, and completed work photo are required');
      return;
    }

    try {
      if (onAddPortfolioItem) {
        await onAddPortfolioItem({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          beforeImageUrl: beforeImageUrl.trim().length > 0 ? beforeImageUrl.trim() : null,
          afterImageUrl: afterImageUrl.trim(),
          completedDate: completedDate || new Date().toISOString(),
          brainWorkerId: 'worker-owner',
          updatedAt: new Date().toISOString(),
        });
      }
      setIsAddModalOpen(false);
      setTitle('');
      setDescription('');
      setCategory('');
      setBeforeImageUrl('');
      setAfterImageUrl('');
      setCompletedDate('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add work sample');
    }
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete && onDeletePortfolioItem) {
      await onDeletePortfolioItem(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with counter indicator and add work trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--lead)] pb-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-main)]">
            Past Work Portfolio
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Showcase verified craftsmanship with before and after project photos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            data-testid="portfolio-count-indicator"
            className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--tag-bg)] px-3 py-1.5 rounded-full border border-[var(--lead)]"
          >
            {portfolioItems.length} / {MAX_PORTFOLIO_ITEMS} items used
          </span>
          <button
            type="button"
            data-testid="add-portfolio-btn"
            disabled={isCapped}
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-lg bg-[var(--amber)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[var(--amber-hover)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Work Sample
          </button>
        </div>
      </div>

      {isCapped && (
        <div className="rounded-lg border border-[var(--amber)]/30 bg-[var(--amber-dim)] p-3 text-xs text-[var(--amber)]">
          Portfolio limit reached. You have uploaded the maximum allowed 20 items. Delete an older sample to add a new project.
        </div>
      )}

      {/* Portfolio Grid */}
      {portfolioItems.length === 0 ? (
        <div
          data-testid="portfolio-empty-state"
          className="rounded-xl border border-dashed border-[var(--lead)] p-8 text-center text-[var(--text-muted)]"
        >
          <p className="text-sm font-medium">No work samples added yet.</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Upload your first completed project to build client confidence.
          </p>
        </div>
      ) : (
        <div
          data-testid="portfolio-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {portfolioItems.map((item) => {
            const hasBefore = Boolean(item.beforeImageUrl);
            const currentView = activeImageToggles[item.id] ?? 'after';
            const displayImageUrl =
              currentView === 'before' && item.beforeImageUrl
                ? item.beforeImageUrl
                : item.afterImageUrl;

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-[var(--lead)] bg-[var(--card-bg)] shadow-sm flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-video w-full bg-[var(--bg)] overflow-hidden">
                  <img
                    src={displayImageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  {hasBefore && (
                    <button
                      type="button"
                      data-testid={`before-after-toggle-${item.id}`}
                      onClick={() => toggleBeforeAfter(item.id)}
                      className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur hover:bg-black/90"
                    >
                      {currentView === 'before' ? 'Show After' : 'Show Before'}
                    </button>
                  )}
                  <span className="absolute top-2 left-2 rounded bg-[var(--bg)] px-2 py-0.5 text-xs font-semibold text-[var(--brand-green)] border border-[var(--lead)]">
                    {item.category}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-[var(--text-main)] text-sm line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--lead)] flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(item.completedDate).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      data-testid={`delete-portfolio-item-btn-${item.id}`}
                      onClick={() => setItemToDelete(item.id)}
                      className="text-xs font-medium text-[var(--danger)] hover:text-[var(--danger)]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div
          data-testid="portfolio-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-lg rounded-xl border border-[var(--lead)] bg-[var(--card-bg)] p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              Add Work Sample
            </h3>

            {formError && (
              <div className="rounded-lg bg-[var(--danger-dim)] border border-[var(--danger-border)] p-2 text-xs text-[var(--danger)]">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5kVA Solar Inverter Setup"
                  className="w-full rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--amber)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Trade Category
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Solar & Inverter"
                  className="w-full rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--amber)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of work done and materials fitted..."
                  className="w-full rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--amber)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    Before Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={beforeImageUrl}
                    onChange={(e) => setBeforeImageUrl(e.target.value)}
                    placeholder="https://example.com/before.jpg"
                    className="w-full rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--amber)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                    After Image URL (Required)
                  </label>
                  <input
                    type="url"
                    required
                    value={afterImageUrl}
                    onChange={(e) => setAfterImageUrl(e.target.value)}
                    placeholder="https://example.com/after.jpg"
                    className="w-full rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--amber)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg bg-[var(--tag-bg)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--card-hover)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--amber)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--amber-hover)]"
                >
                  Add Work
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-[var(--lead)] bg-[var(--card-bg)] p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              Confirm Delete
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Are you sure you want to delete this portfolio sample? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="rounded-lg bg-[var(--tag-bg)] px-4 py-2 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--card-hover)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-[var(--danger)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Confirm Delete Work
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
