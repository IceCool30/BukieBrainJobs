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
    <main className="min-h-screen bg-[#F8F9FF]">
      <NotificationCenter
        customerId={user.id}
        onNavigate={(url) => router.push(url)}
      />

      {/* Footer Channel Preferences Entry Point (Section 11) */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5 text-slate-600" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#001A41]">
                Looking to update SMS, WhatsApp, or Email alerts?
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Configure external delivery channels and multi-channel notification preferences.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/profile?tab=notifications')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-[#001A41] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] focus-visible:ring-offset-2 min-h-[44px] shrink-0"
          >
            Manage Notification Channels in Profile
            <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  );
}
