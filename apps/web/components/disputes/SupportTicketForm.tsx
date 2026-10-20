// apps/web/components/disputes/SupportTicketForm.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 RED: Support Ticket Form Stub

'use client';

import React from 'react';

export interface SupportTicketFormData {
  category: string;
  bookingId?: string;
  email: string;
  message: string;
}

export interface SupportTicketFormProps {
  onSubmit?: (data: SupportTicketFormData) => Promise<void> | void;
  isSubmitting?: boolean;
  initialBookingId?: string;
}

export function SupportTicketForm(
  _props: SupportTicketFormProps
): React.ReactElement {
  return (
    <form data-testid="support-ticket-form">
      <p>Support Ticket Form Stub</p>
    </form>
  );
}
