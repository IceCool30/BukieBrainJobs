// apps/web/app/disputes/[bookingId]/page.tsx
// BW-010: Dispute Handling & Support Interface
// Next.js 15 Server Component: Awaits params and renders DisputeBookingPageView with key={bookingId}
// Strictly zero em dashes in comments, identifiers, or UI text.

import React from 'react';
import { DisputeBookingPageView } from '../../../components/disputes/DisputeBookingPageView';

export interface DisputeBookingPageProps {
  params: Promise<{ bookingId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DisputeBookingPage(
  props: DisputeBookingPageProps
): Promise<React.ReactElement> {
  const resolved = await props.params;
  const bookingId = (resolved?.bookingId || '').trim();
  return <DisputeBookingPageView bookingId={bookingId} key={bookingId} />;
}
