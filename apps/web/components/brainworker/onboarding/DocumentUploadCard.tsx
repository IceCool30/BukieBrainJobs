// apps/web/components/brainworker/onboarding/DocumentUploadCard.tsx
// Phase 3 GREEN: Document Staging & Preview Card Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.2 & 6)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.4 & 4)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 4: DOC-001 to DOC-009)

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadCloud, FileText, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import type {
  DocumentCategory,
  SpecificDocumentType,
  StagedDocument,
} from '../../../lib/brainworker/types';
import { validateDocumentFile } from '../../../lib/brainworker/validation';

export interface DocumentUploadCardProps {
  id?: string | undefined;
  label: string;
  description?: string | undefined;
  category: DocumentCategory;
  specificType: SpecificDocumentType;
  value?: StagedDocument | null | undefined;
  onChange: (file: {
    name: string;
    size: number;
    type: string;
    category: DocumentCategory;
    specificType: SpecificDocumentType;
    previewUrl?: string | undefined;
    file?: File | undefined;
  }) => void | Promise<void>;
  onRemove?: ((documentId: string) => void | Promise<void>) | undefined;
  disabled?: boolean | undefined;
  error?: string | null | undefined;
  required?: boolean | undefined;
  className?: string | undefined;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentUploadCard({
  id,
  label,
  description,
  category,
  specificType,
  value,
  onChange,
  onRemove,
  disabled = false,
  error = null,
  required = false,
  className = '',
}: DocumentUploadCardProps): React.ReactElement {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up ephemeral preview URLs on unmount
  useEffect(() => {
    return () => {
      if (
        localPreviewUrl &&
        typeof window !== 'undefined' &&
        window.URL?.revokeObjectURL &&
        !localPreviewUrl.startsWith('data:')
      ) {
        window.URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const activeError = error || localError;

  const processFile = useCallback(
    (file: File) => {
      if (disabled) return;

      const validationResult = validateDocumentFile({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!validationResult.valid) {
        const errorMsg = validationResult.error || 'Invalid file';
        setLocalError(errorMsg);
        setStatusMessage(errorMsg);
        return;
      }

      setLocalError(null);

      let previewUrl: string | undefined;
      if (
        file.type.startsWith('image/') &&
        typeof window !== 'undefined' &&
        window.URL?.createObjectURL
      ) {
        previewUrl = window.URL.createObjectURL(file);
        setLocalPreviewUrl(previewUrl);
      }

      setStatusMessage(`Document staged: ${file.name}`);

      onChange({
        name: file.name,
        size: file.size,
        type: file.type,
        category,
        specificType,
        previewUrl,
        file,
      });
    },
    [disabled, category, specificType, onChange]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      e.target.value = '';
    },
    [processFile]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [disabled, processFile]
  );

  const handleRemove = useCallback(() => {
    if (disabled || !value) return;
    if (onRemove) {
      onRemove(value.id);
    }
    setStatusMessage(`Document removed: ${value.fileName}`);
    if (
      localPreviewUrl &&
      typeof window !== 'undefined' &&
      window.URL?.revokeObjectURL &&
      !localPreviewUrl.startsWith('data:')
    ) {
      window.URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
  }, [disabled, value, onRemove, localPreviewUrl]);

  const handleReplaceClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const isImage = value?.mimeType.startsWith('image/');
  const isPdf = value?.mimeType === 'application/pdf';

  const previewSrc = value?.previewUrl || localPreviewUrl || '';

  const activeAnnouncement = value
    ? `Document staged: ${value.fileName}`
    : statusMessage;

  return (
    <div
      id={id}
      className={`w-full rounded-lg border bg-[var(--card-bg)] p-5 transition-colors ${
        activeError
          ? 'border-red-300 dark:border-red-800'
          : isDragging
          ? 'border-[#001A41] dark:border-emerald-500 bg-blue-50/30 dark:bg-emerald-950/20'
          : 'border-[var(--card-border)]'
      } ${disabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
    >
      {/* Accessible screen-reader status region */}
      <div role="status" aria-live="polite" className="sr-only">
        {activeAnnouncement}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        data-testid="document-file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        disabled={disabled}
        onChange={handleFileInputChange}
        className="hidden"
        aria-label={`Upload ${label}`}
      />

      {/* Header with Label and Description */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[var(--text-main)]">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {description && (
          <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Error Announcement */}
      {activeError && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-300 border border-red-200 dark:border-red-850"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{activeError}</span>
        </div>
      )}

      {/* Staged State: Either Image Preview or PDF Document Card */}
      {value ? (
        <div className="space-y-4">
          {isImage ? (
            <div className="relative overflow-hidden rounded-lg border border-[var(--card-border)] bg-[var(--bg)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewSrc}
                alt={`Preview of ${value.fileName}`}
                className="max-h-48 w-full object-contain rounded-lg bg-slate-900/5 dark:bg-white/5 p-1"
              />
            </div>
          ) : isPdf ? (
            <div className="flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--bg)] p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-red-50 dark:bg-red-950/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60">
                    PDF Document
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {value.fileName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {formatFileSize(value.fileSizeBytes)}
                </p>
              </div>
            </div>
          ) : null}

          {/* Staged Image Details */}
          {isImage && (
            <div className="flex items-center justify-between px-1">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                  {value.fileName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {formatFileSize(value.fileSizeBytes)}
                </p>
              </div>
            </div>
          )}

          {/* Staged Document Actions: Replace & Remove */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={disabled}
              onClick={handleReplaceClick}
              aria-label={`Replace ${value.fileName}`}
              className={`inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              <span>Replace</span>
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={handleRemove}
              aria-label={`Remove ${value.fileName}`}
              className={`inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 shadow-xs transition hover:bg-red-50 dark:hover:bg-red-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty Dropzone State */
        <div
          data-testid="document-dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled) {
              fileInputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition ${
            isDragging
              ? 'border-[#001A41] dark:border-emerald-500 bg-blue-50/50 dark:bg-emerald-950/20'
              : 'border-[var(--card-border)] hover:border-slate-400 dark:hover:border-slate-600 bg-[var(--bg)]'
          } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-emerald-950/40 text-[#001A41] dark:text-emerald-400 mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            JPG, PNG, WEBP, or PDF up to 5 MB
          </p>
        </div>
      )}
    </div>
  );
}
