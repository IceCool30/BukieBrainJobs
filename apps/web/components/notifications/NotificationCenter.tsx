// apps/web/components/notifications/NotificationCenter.tsx
// Phase 4 RED: Notification Center Component Stub
// Authoritative Reference: WEB-018 UX Design Specification v1.0

import React from 'react';
import type { INotificationRepository } from '../../lib/notifications/types';

export interface NotificationCenterProps {
  customerId: string;
  repository?: INotificationRepository;
  onNavigate?: (url: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = () => {
  return (
    <div data-testid="notification-center-stub">
      {/* Phase 4 RED Stub: Feed and tab infrastructure not yet implemented */}
    </div>
  );
};
