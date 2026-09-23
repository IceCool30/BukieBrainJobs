'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';

export interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Focus management
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // MED-008: Close on Escape key
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  // Click outside to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle Escape key on document level for MED-008
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focus trap and restoration
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // Store the currently focused element before opening
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Focus the dialog when it opens
    const focusableElements = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0]?.focus();
    } else {
      dialog.focus();
    }

    // Restore focus when dialog closes
    return () => {
      previouslyFocused?.focus();
    };
  }, [onClose]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      open={true}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="relative max-w-[90vw] max-h-[90vh] bg-transparent">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="absolute -top-12 right-0 text-white hover:bg-white/10 rounded-full p-2 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image */}
        <img
          src={src}
          alt={alt}
          role="img"
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </dialog>
  );
}
