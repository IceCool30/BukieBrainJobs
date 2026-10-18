// apps/web/components/onsite/CompletionSubmissionForm.tsx
// BW-008: On-Site Work & In-Progress Verification
// Technician Completion Submission Form

'use client';

import React, { useState } from 'react';

export interface CompletionSubmissionFormProps {
  bookingId: string;
  hasPendingScopeAdjustment?: boolean | undefined;
  onSubmitCompletion: (payload: {
    photoProofUrls: string[];
    summaryNote: string;
  }) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
}

export function CompletionSubmissionForm({
  hasPendingScopeAdjustment = false,
  onSubmitCompletion,
  isSubmitting = false,
}: CompletionSubmissionFormProps): React.ReactElement {
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [summaryNote, setSummaryNote] = useState('');

  const handleAddPhoto = () => {
    const trimmed = photoUrlInput.trim();
    if (trimmed.length > 0 && !photoUrls.includes(trimmed)) {
      setPhotoUrls([...photoUrls, trimmed]);
      setPhotoUrlInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const isFormValid =
    !hasPendingScopeAdjustment &&
    photoUrls.length > 0 &&
    summaryNote.trim().length > 0 &&
    !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }

    void onSubmitCompletion({
      photoProofUrls: photoUrls,
      summaryNote: summaryNote.trim(),
    });
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-xl">
      <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
        <h3 className="text-lg font-semibold text-zinc-100">
          Submit Work Completion
        </h3>
        <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
          Final Verification
        </span>
      </div>

      {hasPendingScopeAdjustment && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-amber-800 bg-amber-950/60 p-3 text-sm text-amber-300"
        >
          Pending scope adjustment must be resolved before submitting completion.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="photo-proof-url"
            className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400"
          >
            Photo Proof URL
          </label>
          <div className="flex gap-2">
            <input
              id="photo-proof-url"
              type="text"
              aria-label="Photo proof URL"
              placeholder="https://cdn.bukiebrainjobs.com/proof/..."
              value={photoUrlInput}
              onChange={(e) => setPhotoUrlInput(e.target.value)}
              disabled={hasPendingScopeAdjustment || isSubmitting}
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
            />
            <button
              type="button"
              aria-label="Add photo"
              onClick={handleAddPhoto}
              disabled={
                hasPendingScopeAdjustment ||
                isSubmitting ||
                photoUrlInput.trim().length === 0
              }
              className="min-h-[44px] rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
            >
              Add photo
            </button>
          </div>

          {photoUrls.length > 0 && (
            <ul className="mt-2 space-y-1">
              {photoUrls.map((url, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300"
                >
                  <span className="truncate pr-2 font-mono">{url}</span>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="text-zinc-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label
            htmlFor="summary-note"
            className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400"
          >
            Completion Summary Note
          </label>
          <textarea
            id="summary-note"
            rows={3}
            aria-label="Completion summary note"
            placeholder="Summarize the completed work, tests conducted, or operational checks..."
            value={summaryNote}
            onChange={(e) => setSummaryNote(e.target.value)}
            disabled={hasPendingScopeAdjustment || isSubmitting}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          aria-label="Submit work completion"
          disabled={!isFormValid}
          className="flex w-full min-h-[44px] items-center justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSubmitting ? 'Submitting Completion...' : 'Submit Work Completion'}
        </button>
      </form>
    </div>
  );
}
