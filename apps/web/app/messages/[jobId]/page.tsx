'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import {
  defaultMessagingRepository,
  getSynchronousConversationData,
} from '../../../lib/messaging/defaultRepository';
import { ChatScreen } from '../../../components/messages/ChatScreen';
import type { ChatMessageRecord } from '../../../lib/messaging/types';

interface ChatPageProps {
  params?: Promise<{ jobId: string }>;
}

export default function ChatPage(props: ChatPageProps) {
  const router = useRouter();
  const routeParams = useParams<{ jobId?: string }>();

  let initialJobId = routeParams?.jobId;
  if (!initialJobId && props.params && 'jobId' in props.params && typeof props.params.jobId === 'string') {
    initialJobId = props.params.jobId;
  }

  const [jobId, setJobId] = useState<string | undefined>(initialJobId);

  useEffect(() => {
    if (props.params && typeof (props.params as Promise<{ jobId: string }>).then === 'function') {
      (props.params as Promise<{ jobId: string }>).then((p) => {
        if (p?.jobId) setJobId(p.jobId);
      });
    }
  }, [props.params]);

  const activeJobId = jobId || initialJobId || routeParams?.jobId || 'job-act-001';

  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    const current = getMockAuthenticatedUser();
    setUser(current);
    setAuthChecked(true);
    if (!current) router.replace(`/login?returnUrl=/messages/${encodeURIComponent(activeJobId)}`);
  }, [router, activeJobId]);

  // Authorize caller against conversation record fail-closed
  const convData = useMemo(() => {
    return user
      ? getSynchronousConversationData(user.id, activeJobId)
      : { isUnauthorized: true as const };
  }, [user, activeJobId]);

  const [messages, setMessages] = useState<ChatMessageRecord[]>(() => {
    return !convData.isUnauthorized ? convData.messages : [];
  });

  useEffect(() => {
    if (!convData.isUnauthorized) {
      setMessages(convData.messages);
    }
  }, [convData]);

  if (!authChecked || !user) {
    return <main className="h-screen bg-[var(--bg)]" aria-busy="true" />;
  }

  if (convData.isUnauthorized) {
    return (
      <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 text-[var(--text-main)] font-sans">
        <div role="alert" className="max-w-md w-full bg-[var(--card-bg)] rounded-lg p-8 border border-[var(--danger-border)] shadow-xs text-center">
          <h1 className="text-xl font-bold font-display text-[var(--danger)] mb-2">Access Denied</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
            You do not have permission to view this conversation, or the booking is invalid.
          </p>
        </div>
      </main>
    );
  }

  const { conversation } = convData;

  const handleSendMessage = async (content: string) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const sent = await defaultMessagingRepository.sendMessage(user.id, {
      jobId: activeJobId,
      content,
      contentType: 'text',
      tempId,
    });
    setMessages((prev) => [...prev, sent]);
    return sent;
  };

  return (
    <main className="h-screen flex flex-col bg-[var(--bg)] text-[var(--text-main)]">
      <ChatScreen
        jobId={activeJobId}
        currentUserId={user.id}
        currentUserName={user.name}
        currentUserRole={(user.role as 'customer' | 'brainworker') || 'customer'}
        participantName={conversation.participant.name}
        participantAvatar={conversation.participant.avatarUrl}
        participantIsVerified={conversation.participant.isVerified}
        referenceCode={conversation.referenceCode}
        serviceTitle={conversation.serviceTitle}
        bookingStatus={conversation.bookingStatus}
        messages={messages}
        transportState="connected"
        onSendMessage={handleSendMessage}
      />
    </main>
  );
}
