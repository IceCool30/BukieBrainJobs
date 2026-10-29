// apps/web/components/onsite/ScopeAdjustmentModal.tsx
// BW-008: On-Site Work & In-Progress Verification
// Technician Scope Adjustment Modal

'use client';

import React, { useState } from 'react';
import type { ScopeAdjustmentReasonCategory } from '../../lib/onsite/types';

export interface ScopeAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: {
    category: ScopeAdjustmentReasonCategory;
    description: string;
    additionalLaborKobo: number;
    additionalMaterialsKobo: number;
  }) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
}

export function ScopeAdjustmentModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ScopeAdjustmentModalProps): React.ReactElement | null {
  const [category, setCategory] =
    useState<ScopeAdjustmentReasonCategory>('ADDITIONAL_PARTS');
  const [laborInput, setLaborInput] = useState('');
  const [materialsInput, setMaterialsInput] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) {
    return null;
  }

  const laborKobo = Math.max(0, parseInt(laborInput || '0', 10) || 0);
  const materialsKobo = Math.max(0, parseInt(materialsInput || '0', 10) || 0);
  const totalAdditionalKobo = laborKobo + materialsKobo;
  const isFormValid =
    totalAdditionalKobo > 0 && description.trim().length > 0 && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }

    void onSubmit({
      category,
      description: description.trim(),
      additionalLaborKobo: laborKobo,
      additionalMaterialsKobo: materialsKobo,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scope-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2
            id="scope-modal-title"
            className="text-lg font-semibold text-zinc-100"
          >
            Request On-Site Scope Adjustment
          </h2>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reason-category"
              className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400"
            >
              Reason Category
            </label>
            <select
              id="reason-category"
              aria-label="Reason category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as ScopeAdjustmentReasonCategory)
              }
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ADDITIONAL_PARTS">Additional Parts</option>
              <option value="ADDITIONAL_LABOR">Additional Labor</option>
              <option value="BOTH">Both</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="labor-kobo"
                className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Additional Labor (Kobo)
              </label>
              <input
                id="labor-kobo"
                type="number"
                min="0"
                step="1"
                aria-label="Additional labor"
                placeholder="0"
                value={laborInput}
                onChange={(e) => setLaborInput(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label
                htmlFor="materials-kobo"
                className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400"
              >
                Additional Materials (Kobo)
              </label>
              <input
                id="materials-kobo"
                type="number"
                min="0"
                step="1"
                aria-label="Additional materials"
                placeholder="0"
                value={materialsInput}
                onChange={(e) => setMaterialsInput(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Derived Additional Amount</span>
              <span
                data-testid="derived-total-adjustment"
                className="font-mono text-sm font-semibold text-amber-400"
              >
                {totalAdditionalKobo.toLocaleString()} kobo (₦{(totalAdditionalKobo / 100).toLocaleString()})
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="scope-description"
              className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400"
            >
              Work Description
            </label>
            <textarea
              id="scope-description"
              rows={3}
              maxLength={500}
              aria-label="Work description"
              placeholder="Describe the unexpected problem, required parts, or additional labor..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="mt-1 text-right text-xs text-zinc-500">
              {description.length}/500
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              aria-label="Cancel"
              onClick={onClose}
              className="min-h-[44px] rounded-full border border-zinc-800 bg-zinc-900 px-5 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              aria-label="Submit scope adjustment"
              disabled={!isFormValid}
              className="min-h-[44px] outlier-pill-button rounded-full bg-[var(--amber)] px-5 py-2 text-sm font-semibold text-[#001A41] transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Scope Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
