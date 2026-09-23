'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMockAuthenticatedUser } from '../../lib/auth/storage';
import { ConversationHub } from '../../components/messages/ConversationHub';
import {
  defaultMessagingRepository,
  getSynchronousConversations,
} from '../../lib/messaging/defaultRepository';
import type { ConversationSummary } from '../../lib/messaging/types';

export default function MessagesHubPage() {
  const router = useRouter();
  const user = getMockAuthenticatedUser();

  // If unauthenticated, redirect to /login immediately
  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user, router]);

  const [conversations, setConversations] = useState<ConversationSummary[]>(() => {
    if (!user) return [];
    return getSynchronousConversations(user.id);
  });

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    defaultMessagingRepository
      .getConversations(user.id)
      .then((data) => {
        if (isMounted) {
          setConversations(data);
        }
      })
      .catch(() => {
        // Fallback to synchronous state
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/login');
    }
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F8F9FF] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ConversationHub
          conversations={conversations}
          currentUserId={user.id}
          onSelectConversation={(jobId) => router.push(`/messages/${jobId}`)}
        />
      </div>
    </main>
  );
}
