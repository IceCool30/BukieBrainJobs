'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getMockAuthenticatedUser } from '../../../lib/auth/storage';
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

  const user = getMockAuthenticatedUser();
  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

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

  if (!user) {
    router.replace('/login');
    return null;
  }

  if (convData.isUnauthorized) {
    return (
      <main className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6 text-slate-800 font-sans">
        <div role="alert" className="max-w-md w-full bg-white rounded-2xl p-8 border border-red-200 shadow-sm text-center">
          <h1 className="text-xl font-bold font-display text-red-600 mb-2">Access Denied</h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
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
    <main className="h-screen flex flex-col bg-white">
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
