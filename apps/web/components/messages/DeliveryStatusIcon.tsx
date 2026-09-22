'use client';

import React from 'react';
import { Clock, Check, CheckCheck, AlertCircle, X } from 'lucide-react';
import type { ClientMessageStatus } from '../../lib/messaging/types';

export interface DeliveryStatusIconProps {
  status: ClientMessageStatus;
  className?: string | undefined;
}

const ICONS = {
  sending: Clock,
  sent: Check,
  delivered: CheckCheck,
  read: CheckCheck,
  failed: AlertCircle,
} as const;

const COLOR_CLASSES = {
  sending: 'text-amber-500',
  sent: 'text-slate-400',
  delivered: 'text-slate-600',
  read: 'text-emerald-600',
  failed: 'text-red-500',
} as const;

const TITLES = {
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Alert: Failed to send',
} as const;

export function DeliveryStatusIcon({
  status,
  className = '',
}: DeliveryStatusIconProps) {
  const Icon = ICONS[status];
  const colorClass = COLOR_CLASSES[status];
  const title = TITLES[status];

  return (
    <span role="img" aria-label={title.toLowerCase()} className={`inline-flex items-center justify-center ${colorClass} ${className}`} title={title}>
      <Icon className="w-3.5 h-3.5" />
    </span>
  );
}
