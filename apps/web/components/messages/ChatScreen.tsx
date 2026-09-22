'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, Clock } from 'lucide-react';
import type {
  ChatMessageRecord,
  ClientMessageStatus,
  MessagingBookingStatus,
  TransportState,
} from '../../lib/messaging/types';
import { isReadOnlyBookingStatus } from '../../lib/messaging/types';
import { ChatHeader } from './ChatHeader';
import { ChatComposer } from './ChatComposer';
import { MessageBubble } from './MessageBubble';

export interface ChatScreenProps {
  jobId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'customer' | 'brainworker';
  participantName: string;
  participantAvatar?: string | undefined;
  participantIsVerified: boolean;
  referenceCode: string;
  serviceTitle: string;
  bookingStatus: MessagingBookingStatus;
  messages: ChatMessageRecord[];
  transportState: TransportState;
  onSendMessage: (content: string) => Promise<ChatMessageRecord> | void;
  onRetryFailedMessage?: ((tempId: string) => void) | undefined;
}

function formatDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateStr = date.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function shouldShowDateSeparator(
  currentIndex: number,
  messages: ChatMessageRecord[]
): boolean {
  if (currentIndex === 0) return true;
  if (currentIndex >= messages.length || currentIndex - 1 < 0) return false;
  
  const currentMsg = messages[currentIndex]!;
  const prevMsg = messages[currentIndex - 1]!;
  const currentDate = new Date(currentMsg.createdAt).toISOString().split('T')[0];
  const prevDate = new Date(prevMsg.createdAt).toISOString().split('T')[0];
  
  return currentDate !== prevDate;
}

// Client-augmented message type for tracking send status
interface MessageWithStatus extends ChatMessageRecord {
  clientStatus?: ClientMessageStatus | undefined;
  tempId?: string | undefined;
}

export function ChatScreen({
  jobId,
  currentUserId,
  currentUserName,
  currentUserRole,
  participantName,
  participantAvatar,
  participantIsVerified,
  referenceCode,
  serviceTitle,
  bookingStatus,
  messages: initialMessages,
  transportState,
  onSendMessage,
  onRetryFailedMessage,
}: ChatScreenProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<MessageWithStatus[]>(initialMessages);
  const [failedTempIds, setFailedTempIds] = useState<Set<string>>(new Set());
  const [sendingTempIds, setSendingTempIds] = useState<Set<string>>(new Set());
  const isReadOnly = isReadOnlyBookingStatus(bookingStatus);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update messages when initialMessages prop changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Generate tempId for new messages
  const generateTempId = useCallback(() => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Handle sending a new message
  const handleSendMessage = useCallback(
    async (content: string) => {
      const tempId = generateTempId();
      
      // Create optimistic message
      const optimisticMessage: MessageWithStatus = {
        id: tempId,
        jobId,
        senderId: currentUserId,
        senderRole: currentUserRole,
        senderName: currentUserName,
        senderAvatar: undefined,
        content,
        contentType: 'text',
        isRead: false,
        createdAt: new Date().toISOString(),
        clientStatus: 'sending',
        tempId,
      };

      // Add to UI immediately
      setMessages((prev) => [...prev, optimisticMessage]);
      setSendingTempIds((prev) => new Set(prev).add(tempId));

      try {
        // Call the actual send function
        const sentMessage = await onSendMessage(content);
        
        // Replace optimistic message with server-returned message
        setMessages((prev) =>
          prev.map((m) => (m.tempId === tempId ? { ...sentMessage, tempId, clientStatus: 'sent' } as MessageWithStatus : m))
        );
      } catch (err) {
        // Mark as failed
        setMessages((prev) =>
          prev.map((m) => (m.tempId === tempId ? { ...m, clientStatus: 'failed' } : m))
        );
        setFailedTempIds((prev) => new Set(prev).add(tempId));
        throw err;
      } finally {
        setSendingTempIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
      }
    },
    [currentUserId, currentUserName, currentUserRole, jobId, onSendMessage, generateTempId]
  );

  // Handle retry for failed messages
  const handleRetryMessage = useCallback(
    (tempId: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.tempId === tempId ? { ...m, clientStatus: 'sending' } : m
        )
      );
      setFailedTempIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
      setSendingTempIds((prev) => new Set(prev).add(tempId));

      // Find the message and retry
      const message = messages.find((m) => m.tempId === tempId);
      if (message) {
        handleSendMessage(message.content);
      }
    },
    [messages, handleSendMessage]
  );

  // Group messages by date for date separators
  const renderMessages = () => {
    return messages.map((message, index) => {
      const isCurrentUser = message.senderId === currentUserId;
      const showDateSeparator = shouldShowDateSeparator(index, messages);
      const dateLabel = showDateSeparator ? formatDateLabel(message.createdAt) : undefined;
      
      // Determine client status
      let status: ClientMessageStatus | undefined;
      // Check for explicit status on message (for testing)
      if ('status' in message && message.status) {
        status = message.status as ClientMessageStatus;
      } else if (message.clientStatus) {
        status = message.clientStatus;
      } else if (failedTempIds.has(message.tempId || '')) {
        status = 'failed';
      } else if (sendingTempIds.has(message.tempId || '')) {
        status = 'sending';
      } else {
        // Server message - determine status from isRead
        // For incoming messages, we don't show read receipts
        // For outgoing messages, check isRead
        if (isCurrentUser && message.isRead) {
          status = 'read';
        } else if (isCurrentUser && !message.isRead) {
          // We need to track if it was delivered
          // For now, default to sent for server messages
          status = 'sent';
        }
      }

      return (
        <MessageBubble
          key={message.tempId || message.id}
          message={message}
          status={status}
          isCurrentUser={isCurrentUser}
          showDateSeparator={showDateSeparator}
          dateLabel={dateLabel}
          onRetry={status === 'failed' && message.tempId ? () => handleRetryMessage(message.tempId!) : undefined}
        />
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <ChatHeader
        participantName={participantName}
        participantAvatar={participantAvatar}
        participantIsVerified={participantIsVerified}
        referenceCode={referenceCode}
        jobId={jobId}
        serviceTitle={serviceTitle}
      />

      {/* BukieGuarantee Banner */}
      <div
        role="region"
        aria-label="Escrow protection banner"
        className="bg-[#296A4B]/5 border border-[#296A4B]/20 px-4 py-2.5 text-center"
      >
        <p className="text-xs text-[#296A4B] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 inline align-middle mr-1" />
          BukieGuarantee: Your payment is escrow-protected until you confirm satisfaction
        </p>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        role="region"
        aria-label="Message list"
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
      >
        {/* New message announcement for screen readers */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {messages.length > 0 && (
            <span>New message received</span>
          )}
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-[#001A41] mb-2">No messages yet</h2>
            <p className="text-sm text-slate-500 max-w-md">
              Your booking with {participantName} is confirmed. Use this space to confirm
              arrival time, clarify tools, or give specific house directions.
            </p>
          </div>
        ) : (
          renderMessages()
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <div className="px-4 py-3 border-t border-slate-200 bg-white">
        <ChatComposer
          currentUserId={currentUserId}
          bookingStatus={bookingStatus}
          transportState={transportState}
          isReadOnly={isReadOnly}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
