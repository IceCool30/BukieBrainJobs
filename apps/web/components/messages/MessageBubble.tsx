'use client';

import React from 'react';
import type { ChatMessageRecord, ClientMessageStatus } from '../../lib/messaging/types';
import { DeliveryStatusIcon } from './DeliveryStatusIcon';

export interface MessageBubbleProps {
  message: ChatMessageRecord;
  status?: ClientMessageStatus | undefined;
  isCurrentUser: boolean;
  showDateSeparator?: boolean | undefined;
  dateLabel?: string | undefined;
  onRetry?: (() => void) | undefined;
}

function getSenderInitials(name: string): string {
  return name
    .replace(/^(Engr\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s+/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatMessageTimestamp(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 60) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffHour < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDay === 1) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function MessageBubble({
  message,
  status = 'sent',
  isCurrentUser,
  showDateSeparator = false,
  dateLabel,
  onRetry,
}: MessageBubbleProps) {
  const isFailed = status === 'failed';
  const isSending = status === 'sending';
  const isRead = status === 'read';
  const isDelivered = status === 'delivered';
  const isSent = status === 'sent';

  const bubbleClasses = isCurrentUser
    ? 'bg-[#001A41] text-white rounded-br-sm'
    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm';

  const timestamp = formatMessageTimestamp(message.createdAt);

  return (
    <div className="flex flex-col gap-1">
      {/* Date separator */}
      {showDateSeparator && dateLabel && (
        <div
          role="separator"
          aria-label={dateLabel}
          className="flex items-center justify-center my-2"
        >
          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full">
            {dateLabel}
          </span>
        </div>
      )}

      <div
        className={`flex gap-2.5 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
        role="article"
        aria-label={`Message from ${message.senderName}`}
      >
        {/* Avatar for incoming messages */}
        {!isCurrentUser && (
          <div className="flex-shrink-0 self-end pb-1">
            {message.senderAvatar ? (
              <img
                src={message.senderAvatar}
                alt={message.senderName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center select-none"
                aria-hidden="true"
              >
                {getSenderInitials(message.senderName)}
              </div>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className={`max-w-[80%] lg:max-w-[60%] ${isCurrentUser ? 'order-first' : ''}`}>
          <div
            className={`relative px-4 py-2.5 text-sm rounded-2xl ${bubbleClasses} ${isSending ? 'opacity-60' : ''}`}
          >
            <p className="whitespace-pre-wrap break-words" style={{ float: isCurrentUser ? 'right' : 'left' }}>
              {message.content}
            </p>

            {/* Message meta: timestamp and status */}
            <div
              className={`flex items-center justify-end gap-1.5 mt-1.5 ${isCurrentUser ? 'text-white/60' : 'text-slate-400'}`}
            >
              <span className="text-[10px]">{timestamp}</span>
              
              {/* Delivery status icons for current user's messages */}
              {isCurrentUser && (
                <>
                  {isSending && (
                    <span className="flex items-center gap-0.5 text-white/60">
                      <DeliveryStatusIcon status="sending" />
                    </span>
                  )}
                  {isSent && (
                    <span className="flex items-center gap-0.5 text-white/60">
                      <DeliveryStatusIcon status="sent" />
                    </span>
                  )}
                  {isDelivered && (
                    <span className="flex items-center gap-0.5 text-white/60">
                      <DeliveryStatusIcon status="delivered" />
                    </span>
                  )}
                  {isRead && (
                    <span className="flex items-center gap-0.5">
                      <DeliveryStatusIcon status="read" />
                    </span>
                  )}
                  {isFailed && onRetry && (
                    <>
                      <span className="flex items-center gap-0.5">
                        <DeliveryStatusIcon status="failed" />
                      </span>
                      <button
                        type="button"
                        onClick={onRetry}
                        className="text-[10px] font-medium hover:underline whitespace-nowrap"
                      >
                        Retry
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Failed message alert for failed sends */}
          {isFailed && !isCurrentUser && (
            <div
              role="alert"
              className="mt-1 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-600"
            >
              Message failed to deliver
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
