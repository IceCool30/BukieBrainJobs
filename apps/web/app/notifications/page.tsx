// apps/web/app/notifications/page.tsx
// Phase 6 GREEN: Authenticated Notifications Page Route
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 8: INT-001, INT-002, INT-009, INT-010)
// - docs/specs/WEB-018-ux-design-specification.md (Section 3, 8, 11)
// - docs/specs/WEB-018-architecture-contract.md (Section 4 & 5)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sliders, ChevronRight } from 'lucide-react';
import { getMockAuthenticatedUser } from '../../lib/auth/storage';
import { NotificationCenter } from '../../components/notifications/NotificationCenter';

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(() => getMockAuthenticatedUser());

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);
    if (!currentUser) {
      router.replace('/login?redirect=/notifications');
    }
  }, [router]);

  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/login?redirect=/notifications');
    }
    return null;
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)]">
      <NotificationCenter
        customerId={user.id}
        onNavigate={(url) => router.push(url)}
      />

      {/* Footer Channel Preferences Entry Point (Section 11) */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="p-6 rounded-lg bg-[var(--card-bg)] text-[var(--text-main)] border border-[var(--lead)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--tag-bg)] text-[var(--amber)] border border-[var(--lead)] flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 text-[var(--amber)]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-[var(--text-main)]">
                Looking to update SMS, WhatsApp, or Email alerts?
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Configure external delivery channels and multi-channel notification preferences.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/profile?tab=notifications')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[var(--tag-bg)] hover:bg-[var(--card-hover)] text-[var(--text-main)] border border-[var(--lead)] hover:border-[var(--amber)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 min-h-[44px] shrink-0 cursor-pointer"
          >
            Manage Notification Channels in Profile
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  );
}
