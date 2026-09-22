'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle } from 'lucide-react';
import type { MessagingBookingStatus, TransportState } from '../../lib/messaging/types';

export interface ChatComposerProps {
  currentUserId: string;
  bookingStatus: MessagingBookingStatus;
  transportState: TransportState;
  isReadOnly: boolean;
  onSendMessage: (content: string) => void | Promise<void>;
  disabled?: boolean | undefined;
}

const MAX_CHARACTERS = 2000;
const CHAR_COUNTER_THRESHOLD = 1500;

export function ChatComposer({
  currentUserId,
  bookingStatus,
  transportState,
  isReadOnly,
  onSendMessage,
  disabled = false,
}: ChatComposerProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = isReadOnly || disabled || isSending;
  const characterCount = content.length;
  const showCharacterCounter = characterCount > CHAR_COUNTER_THRESHOLD;
  const hasContent = content.trim().length > 0;

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current && !isReadOnly) {
      textareaRef.current.focus();
    }
  }, [isReadOnly]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CHARACTERS) {
      setContent(newValue);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasContent || isDisabled) return;

    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    setIsSending(true);
    setError(null);

    try {
      await onSendMessage(trimmedContent);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
      // Keep focus on textarea after send
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Enter' && e.shiftKey) {
      // Explicitly handle Shift+Enter to insert newline
      // This ensures it works in both real browsers and test environments
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = content.substring(0, start) + '\n' + content.substring(end);
      setContent(newValue);
      // Move cursor to after the newline
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  if (isReadOnly) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center"
      >
        {bookingStatus === 'COMPLETED' && (
          <p className="text-sm text-slate-600">This job was completed. Messaging is closed.</p>
        )}
        {bookingStatus === 'CANCELLED' && (
          <p className="text-sm text-slate-600">This booking was cancelled. Messaging is closed.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Transport state indicator */}
      {transportState === 'polling' && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-medium text-amber-600"
        >
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span>Connecting... Polling for updates every 4s</span>
        </div>
      )}

      {transportState === 'reconnecting' && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-medium text-amber-600"
        >
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <span>Reconnecting...</span>
        </div>
      )}

      {transportState === 'offline' && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-medium text-slate-600"
        >
          <span className="w-2 h-2 bg-slate-400 rounded-full" />
          <span>Offline. Messages will be queued.</span>
        </div>
      )}

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isSending ? 'Sending...' : 'Type your message here...'}
          disabled={isDisabled}
          aria-label="Message input"
          aria-describedby={showCharacterCounter ? 'char-counter' : undefined}
          className="w-full min-h-[44px] max-h-[200px] px-4 py-3 pr-12 text-sm text-slate-700 bg-white border border-slate-300 rounded-2xl resize-none placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#001A41] focus:border-[#001A41] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          rows={1}
        />
        {showCharacterCounter && (
          <div
            id="char-counter"
            className="absolute bottom-1 right-2 text-[11px] text-slate-400"
          >
            {characterCount} / {MAX_CHARACTERS}
          </div>
        )}
        <button
          type="submit"
          disabled={!hasContent || isDisabled}
          aria-label="Send message"
          className="absolute bottom-1.5 right-1.5 p-1.5 text-[#001A41] disabled:text-slate-300 disabled:cursor-not-allowed hover:bg-slate-100 rounded-full transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
