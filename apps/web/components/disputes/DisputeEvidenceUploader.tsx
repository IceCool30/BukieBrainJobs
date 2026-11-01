// apps/web/components/disputes/DisputeEvidenceUploader.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 GREEN: Dispute Evidence Uploader Component

'use client';

import React, { useEffect, useId, useState } from 'react';
import type {
  DisputeAllowedMimeType,
  DisputeEvidence,
  DisputeParticipantRole,
} from '../../lib/disputes/types';
import { evidenceStore } from '../../lib/disputes/evidence-store';

export interface DisputeEvidenceUploaderProps {
  evidenceList: DisputeEvidence[];
  onChange: (items: DisputeEvidence[]) => void;
  uploaderId?: string;
  uploaderRole?: DisputeParticipantRole;
  maxItems?: number;
  disabled?: boolean;
  sessionId?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // Exactly 5,242,880 bytes (5 MiB)
const ALLOWED_MIME_TYPES: DisputeAllowedMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export function DisputeEvidenceUploader({
  evidenceList = [],
  onChange,
  uploaderId = '',
  uploaderRole,
  maxItems = 5,
  disabled = false,
  sessionId: propSessionId,
}: DisputeEvidenceUploaderProps): React.ReactElement {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputId = useId();
  const sessionId = propSessionId || `uploader-${inputId}`;

  const isAuthValid = Boolean(uploaderId && uploaderId.trim() && uploaderRole);
  const isLimitReached = evidenceList.length >= maxItems;
  const isInputDisabled = disabled || isLimitReached || !isAuthValid;

  useEffect(() => {
    return () => {
      // Clear uncommitted draft blobs for this session when uploader unmounts without submit
      evidenceStore.clearDraftBlobs(sessionId);
    };
  }, [sessionId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);

    // Enforce guard conditions in handler path
    if (disabled || isLimitReached || !isAuthValid || !uploaderRole) {
      event.target.value = '';
      return;
    }

    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('File size exceeds 5 MB limit. Please select a smaller photo or document.');
      event.target.value = '';
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type as DisputeAllowedMimeType)) {
      setErrorMessage('Unsupported file format. Please upload JPEG, PNG, WEBP, or PDF files.');
      event.target.value = '';
      return;
    }

    let previewUrl: string;
    try {
      previewUrl = evidenceStore.registerDraftBlob(file, sessionId);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to process local file in this environment.'
      );
      event.target.value = '';
      return;
    }

    const newEvidence: DisputeEvidence = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      uploaderId: uploaderId.trim(),
      uploaderRole,
      fileType: file.type as DisputeAllowedMimeType,
      previewUrl,
      caption: file.name,
      uploadedAt: new Date().toISOString(),
      sizeBytes: file.size,
    };

    onChange([...evidenceList, newEvidence]);
    event.target.value = '';
  };

  const handleRemove = (id: string) => {
    if (disabled) return;

    const target = evidenceList.find((item) => item.id === id);
    if (target?.previewUrl) {
      evidenceStore.releaseDraftBlob(target.previewUrl, sessionId);
    }
    onChange(evidenceList.filter((item) => item.id !== id));
  };

  return (
    <div data-testid="dispute-evidence-uploader" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
        >
          Upload Evidence / Attach Photo
        </label>
        <span className="text-xs text-[var(--text-muted)]">
          {evidenceList.length} of {maxItems} files
        </span>
      </div>

      {!isAuthValid && (
        <p className="rounded-md border border-[var(--rule)] bg-[var(--bg)] p-2 text-xs text-[var(--text-muted)]">
          Authentication required: caller context missing for evidence upload.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={isInputDisabled}
          onChange={handleFileChange}
          className="block w-full text-xs text-[var(--text-muted)] file:mr-3 file:min-h-[38px] file:rounded-md file:border-0 file:bg-[var(--lead)] file:px-3 file:text-xs file:font-semibold file:text-[var(--text-main)] hover:file:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
        />

        {errorMessage && (
          <p
            role="alert"
            className="rounded-md border border-[var(--danger-border)] bg-[var(--danger-dim)] p-2.5 text-xs font-medium text-[var(--danger)]"
          >
            {errorMessage}
          </p>
        )}

        {isLimitReached && (
          <p className="text-xs font-medium text-[var(--amber)]">
            Maximum of {maxItems} evidence attachments limit reached.
          </p>
        )}
      </div>

      {evidenceList.length > 0 && (
        <ul className="flex flex-col gap-2 pt-1" aria-label="Attached evidence list">
          {evidenceList.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md border border-[var(--lead)] bg-[var(--card-bg)] px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold text-[var(--text-main)]">
                  Proof {index + 1}:
                </span>
                <span className="truncate text-[var(--text-muted)]">
                  {item.caption || item.fileType}
                </span>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">
                  ({Math.round(item.sizeBytes / 1024)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                disabled={disabled}
                aria-label={`Remove proof ${index + 1}`}
                className="ml-2 font-medium text-[var(--danger)] hover:underline disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] rounded"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
