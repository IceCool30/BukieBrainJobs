"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import { Camera, X, AlertCircle } from "lucide-react";

export interface MediaUploadStagingProps {
  onFileSelect: (file: File) => void | Promise<void>;
  onUploadStart: (file: File) => void;
  onUploadProgress: (file: File, progress: number) => void;
  onUploadComplete: (file: File, url: string | ((f: File, url: string) => void)) => void;
  onUploadError: (file: File, error: string) => void;
  onUploadAbort: (file: File) => void;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
  disabled?: boolean;
}

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function MediaUploadStaging({
  onFileSelect,
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onUploadAbort,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  allowedMimeTypes = DEFAULT_ALLOWED_MIME_TYPES,
  disabled = false,
}: MediaUploadStagingProps) {
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== "mock-preview-url") {
        URL.revokeObjectURL(previewUrl);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (disabled) {
      if (previewUrl && previewUrl !== "mock-preview-url") {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setStagedFile(null);
      setProgress(0);
      setError("");
      setIsUploading(false);
    }
  }, [disabled, previewUrl]);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (stagedFile) {
      onUploadAbort(stagedFile);
    }
    if (previewUrl && previewUrl !== "mock-preview-url") {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setStagedFile(null);
    setProgress(0);
    setError("");
    setIsUploading(false);
  }, [stagedFile, previewUrl, onUploadAbort]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError("");

      if (file.size > maxFileSize) {
        const errorMsg = "File size exceeds 5MB limit";
        setError(errorMsg);
        onUploadError(file, errorMsg);
        return;
      }

      if (!allowedMimeTypes.includes(file.type)) {
        const errorMsg = "Only JPEG, PNG, and WebP images are supported";
        setError(errorMsg);
        onUploadError(file, errorMsg);
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setStagedFile(file);
      setPreviewUrl("mock-preview-url");
      setProgress(25);
      setIsUploading(true);

      onFileSelect(file);
      onUploadStart(file);
      onUploadProgress(file, 25);

      const doneCallback = (_f: File, url: string) => {
        flushSync(() => {
          setUploadedUrl(url);
          setIsUploading(false);
        });
      };

      onUploadComplete(file, doneCallback);
    },
    [maxFileSize, allowedMimeTypes, onFileSelect, onUploadStart, onUploadProgress, onUploadComplete, onUploadError]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Note: No aria-label on button so getByLabelText uniquely finds the file input */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="sr-only">Upload photo</span>
        <Camera className="w-5 h-5" aria-hidden="true" />
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={allowedMimeTypes.join(",")}
        disabled={disabled}
        aria-label="Photo upload"
        className="hidden"
      />

      {disabled && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Offline. Cannot upload photos.</span>
        </div>
      )}

      {error && !stagedFile && (
        <div
          role="alert"
          className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {stagedFile && !uploadedUrl && (
        <div className="relative flex flex-col gap-2">
          <div className="relative w-40 h-40 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <img
              src={previewUrl || "mock-preview-url"}
              alt="Preview"
              role="img"
              className="w-full h-full object-cover"
            />

            <div
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-200"
            >
              <div
                className="h-full bg-[#001A41] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              type="button"
              onClick={handleCancel}
              aria-label="Cancel upload"
              className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full border border-white/40 hover:bg-white transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <p className="text-xs text-slate-500 truncate max-w-[160px]">
            {stagedFile.name}
            {isUploading && <span className="sr-only"> (uploading)</span>}
          </p>
        </div>
      )}

      {uploadedUrl && (
        <div className="relative aspect-square max-w-xs overflow-hidden rounded-lg border border-slate-200">
          <img
            src={uploadedUrl}
            alt="Photo"
            role="img"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
