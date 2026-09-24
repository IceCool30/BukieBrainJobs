// apps/web/components/notifications/NotificationBell.tsx
// Phase 6 RED Stub: Navigation Header Bell & Unread Badge (INT-003 & INT-004)
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 8: INT-003, INT-004)
// - docs/specs/WEB-018-ux-design-specification.md (Section 4)
// - docs/specs/WEB-018-architecture-contract.md (Section 2 & 3)

import React from 'react';
import type { INotificationRepository } from '../../lib/notifications/types';

export interface NotificationBellProps {
  customerId?: string | undefined;
  repository?: INotificationRepository | undefined;
  onClick?: (() => void) | undefined;
  className?: string | undefined;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  customerId,
  repository,
  onClick,
  className,
}) => {
  void customerId;
  void repository;
  void onClick;
  void className;

  return (
    <div data-testid="notification-bell-stub">
      {/* Phase 6 RED Stub: Navigation Bell not yet implemented */}
    </div>
  );
};
