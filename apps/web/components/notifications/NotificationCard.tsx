// apps/web/components/notifications/NotificationCard.tsx
// Phase 5 RED Stub: Notification Card Anatomy & Interaction (CRD-001 through CRD-009)
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 6: CRD-001 to CRD-009)
// - docs/specs/WEB-018-ux-design-specification.md (Section 6)
// - docs/specs/WEB-018-architecture-contract.md (Section 2 & 3)

import React from 'react';
import type { CustomerNotification } from '@/lib/notifications';

export interface NotificationCardProps {
  notification: CustomerNotification;
  onNavigate?: (targetUrl: string) => void;
  onMarkAsRead?: (notificationId: string) => Promise<void> | void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onNavigate,
  onMarkAsRead,
}) => {
  void onNavigate;
  void onMarkAsRead;

  return (
    <div data-testid={`notification-card-stub-${notification.id}`}>
      {/* Phase 5 RED Stub: Card anatomy and interaction not yet implemented */}
    </div>
  );
};
