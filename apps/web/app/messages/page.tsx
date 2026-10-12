'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMockAuthenticatedUser } from '../../lib/auth/storage';
import { ConversationHub } from '../../components/messages/ConversationHub';
import {
  defaultMessagingRepository,
  getSynchronousConversations,
} from '../../lib/messaging/defaultRepository';
import type { AuthUser } from '../../lib/auth/types';
import type { ConversationSummary } from '../../lib/messaging/types';

export default function MessagesHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());

  // If unauthenticated, redirect to /login immediately
  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);
    if (!currentUser) {
      router.replace('/login');
    }
  }, [router]);

  const [conversations, setConversations] = useState<ConversationSummary[]>(() => {
    const initialUser = getMockAuthenticatedUser();
    if (!initialUser) return [];
    return getSynchronousConversations(initialUser.id);
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
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
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
