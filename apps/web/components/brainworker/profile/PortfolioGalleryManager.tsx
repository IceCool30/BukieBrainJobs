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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Past Work Portfolio
          </h2>
          <p className="text-xs text-slate-400">
            Showcase verified craftsmanship with before and after project photos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            data-testid="portfolio-count-indicator"
            className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700"
          >
            {portfolioItems.length} / {MAX_PORTFOLIO_ITEMS} items used
          </span>
          <button
            type="button"
            data-testid="add-portfolio-btn"
            disabled={isCapped}
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Work Sample
          </button>
        </div>
      </div>

      {isCapped && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
          Portfolio limit reached. You have uploaded the maximum allowed 20 items. Delete an older sample to add a new project.
        </div>
      )}

      {/* Portfolio Grid */}
      {portfolioItems.length === 0 ? (
        <div
          data-testid="portfolio-empty-state"
          className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400"
        >
          <p className="text-sm font-medium">No work samples added yet.</p>
          <p className="text-xs text-slate-500 mt-1">
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
                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
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
                  <span className="absolute top-2 left-2 rounded bg-slate-900/80 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-slate-700">
                    {item.category}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {new Date(item.completedDate).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      data-testid={`delete-portfolio-item-btn-${item.id}`}
                      onClick={() => setItemToDelete(item.id)}
                      className="text-xs font-medium text-rose-400 hover:text-rose-300"
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
          <div className="w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100">
              Add Work Sample
            </h3>

            {formError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 text-xs text-rose-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5kVA Solar Inverter Setup"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Trade Category
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Solar & Inverter"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of work done and materials fitted..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Before Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={beforeImageUrl}
                    onChange={(e) => setBeforeImageUrl(e.target.value)}
                    placeholder="https://example.com/before.jpg"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    After Image URL (Required)
                  </label>
                  <input
                    type="url"
                    required
                    value={afterImageUrl}
                    onChange={(e) => setAfterImageUrl(e.target.value)}
                    placeholder="https://example.com/after.jpg"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
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
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-slate-100">
              Confirm Delete
            </h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete this portfolio sample? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
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
