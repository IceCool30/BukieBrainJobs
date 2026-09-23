// apps/web/lib/notifications/testing/fixtures.ts
// Deterministic Test Fixtures for WEB-018
// Governed by: WEB-018 Architecture Contract v1.0 & Test-First Implementation Plan v1.0

import type { CustomerNotification } from '../types';

export const FIXTURE_CUSTOMER_A = 'cust-notif-001';
export const FIXTURE_CUSTOMER_B = 'cust-notif-002';
export const FIXTURE_UNAUTHENTICATED = '';

export const FIXTURE_NOTIF_BOOKING_CONFIRMED: CustomerNotification = {
  id: 'notif-bk-001',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'JOB_CONFIRMED',
  category: 'bookings',
  title: 'Artisan Assigned: Engr. Emeka Nwosu',
  message: 'Your booking has been confirmed for 2:00 PM.',
  isRead: false,
  createdAt: '2026-09-23T08:00:00.000Z',
  readAt: null,
  targetUrl: '/jobs?id=job-act-001',
  referenceCode: 'BBJ-LAG-2026-0891',
  metadata: { jobId: 'job-act-001', bookingId: 'bk-001' },
};

export const FIXTURE_NOTIF_BOOKING_STARTED: CustomerNotification = {
  id: 'notif-bk-002',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'JOB_STARTED',
  category: 'bookings',
  title: 'Artisan Arrived On-Site',
  message: 'Engr. Emeka Nwosu has arrived and started generator diagnostics.',
  isRead: false,
  createdAt: '2026-09-23T09:00:00.000Z',
  readAt: null,
  targetUrl: '/jobs?id=job-act-001',
  referenceCode: 'BBJ-LAG-2026-0891',
  metadata: { jobId: 'job-act-001' },
};

export const FIXTURE_NOTIF_BOOKING_COMPLETED: CustomerNotification = {
  id: 'notif-bk-003',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'JOB_COMPLETED',
  category: 'bookings',
  title: 'Work Completed: Inspection Requested',
  message: 'The technician has finished repairs. Please inspect and approve release.',
  isRead: true,
  createdAt: '2026-09-23T10:00:00.000Z',
  readAt: '2026-09-23T10:05:00.000Z',
  targetUrl: '/jobs?id=job-act-001',
  referenceCode: 'BBJ-LAG-2026-0891',
  metadata: { jobId: 'job-act-001' },
};

export const FIXTURE_NOTIF_BOOKING_CANCELLED: CustomerNotification = {
  id: 'notif-bk-004',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'JOB_CANCELLED',
  category: 'bookings',
  title: 'Booking Cancelled',
  message: 'Air conditioner inspection booking has been cancelled.',
  isRead: true,
  createdAt: '2026-09-22T14:00:00.000Z',
  readAt: '2026-09-22T14:10:00.000Z',
  targetUrl: '/jobs?id=job-can-001',
  referenceCode: 'BBJ-LAG-2026-0770',
  metadata: { jobId: 'job-can-001' },
};

export const FIXTURE_NOTIF_MESSAGE_RECEIVED: CustomerNotification = {
  id: 'notif-msg-001',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'MESSAGE_RECEIVED',
  category: 'messages_payments',
  title: 'New Message from Sunday Ogundimu',
  message: 'Good morning sir, I am arriving at your gate now.',
  isRead: false,
  createdAt: '2026-09-23T10:30:00.000Z',
  readAt: null,
  targetUrl: '/messages/job-act-001',
  referenceCode: 'BBJ-LAG-2026-0891',
  metadata: { jobId: 'job-act-001' },
};

export const FIXTURE_NOTIF_PAYMENT_CONFIRMED: CustomerNotification = {
  id: 'notif-pay-001',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'PAYMENT_CONFIRMED',
  category: 'messages_payments',
  title: 'Escrow Payment Verified',
  message: 'Deposit of ₦45,000 is securely held in BukieGuarantee escrow.',
  isRead: false,
  createdAt: '2026-09-23T07:45:00.000Z',
  readAt: null,
  targetUrl: '/receipt/bk-001',
  referenceCode: 'BBJ-LAG-2026-0891',
  metadata: { bookingId: 'bk-001' },
};

export const FIXTURE_NOTIF_PAYMENT_RELEASED: CustomerNotification = {
  id: 'notif-pay-002',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'PAYMENT_RELEASED',
  category: 'messages_payments',
  title: 'Escrow Payment Released',
  message: 'Funds released to artisan following customer satisfaction sign-off.',
  isRead: true,
  createdAt: '2026-09-23T11:00:00.000Z',
  readAt: '2026-09-23T11:02:00.000Z',
  targetUrl: '/receipt/bk-001',
  referenceCode: 'BBJ-LAG-2026-0891',
  metadata: { bookingId: 'bk-001' },
};

export const FIXTURE_NOTIF_PAYMENT_REFUNDED: CustomerNotification = {
  id: 'notif-pay-003',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'PAYMENT_REFUNDED',
  category: 'messages_payments',
  title: 'Refund Processed',
  message: 'Refund of ₦15,000 has been processed to your bank account.',
  isRead: true,
  createdAt: '2026-09-21T16:00:00.000Z',
  readAt: '2026-09-21T16:15:00.000Z',
  targetUrl: '/receipt/bk-ref-001',
  referenceCode: 'BBJ-LAG-2026-0550',
  metadata: { bookingId: 'bk-ref-001' },
};

export const FIXTURE_NOTIF_REVIEW_REQUESTED: CustomerNotification = {
  id: 'notif-rev-001',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'REVIEW_REQUESTED',
  category: 'account',
  title: 'Rate Your Experience',
  message: 'Please rate Sunday Ogundimu for plumbing maintenance.',
  isRead: false,
  createdAt: '2026-09-23T11:15:00.000Z',
  readAt: null,
  targetUrl: '/jobs?id=job-rev-001',
  referenceCode: 'BBJ-LAG-2026-0440',
  metadata: { jobId: 'job-rev-001' },
};

export const FIXTURE_NOTIF_SECURITY_ALERT: CustomerNotification = {
  id: 'notif-sec-001',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'SECURITY_ALERT',
  category: 'account',
  title: 'Password Changed',
  message: 'Your account password was updated successfully.',
  isRead: false,
  createdAt: '2026-09-23T06:00:00.000Z',
  readAt: null,
  targetUrl: '/profile?tab=security',
  metadata: {},
};

export const FIXTURE_NOTIF_VERIFICATION_COMPLETE: CustomerNotification = {
  id: 'notif-ver-001',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'VERIFICATION_COMPLETE',
  category: 'account',
  title: 'Phone Verified',
  message: 'Your Nigerian phone number +234 802 345 6789 was verified.',
  isRead: true,
  createdAt: '2026-09-20T12:00:00.000Z',
  readAt: '2026-09-20T12:01:00.000Z',
  targetUrl: '/profile?tab=personal',
  metadata: {},
};

export const FIXTURE_NOTIF_SYSTEM: CustomerNotification = {
  id: 'notif-sys-001',
  recipientId: FIXTURE_CUSTOMER_A,
  type: 'SYSTEM',
  category: 'account',
  title: 'Scheduled Maintenance Notice',
  message: 'BukieBrainJobs platform will undergo scheduled maintenance at 2:00 AM WAT.',
  isRead: true,
  createdAt: '2026-09-19T10:00:00.000Z',
  readAt: '2026-09-19T10:05:00.000Z',
  targetUrl: '/notifications',
  metadata: {},
};

export const FIXTURE_NOTIFICATIONS_CUSTOMER_A: CustomerNotification[] = [
  FIXTURE_NOTIF_BOOKING_CONFIRMED,
  FIXTURE_NOTIF_BOOKING_STARTED,
  FIXTURE_NOTIF_BOOKING_COMPLETED,
  FIXTURE_NOTIF_BOOKING_CANCELLED,
  FIXTURE_NOTIF_MESSAGE_RECEIVED,
  FIXTURE_NOTIF_PAYMENT_CONFIRMED,
  FIXTURE_NOTIF_PAYMENT_RELEASED,
  FIXTURE_NOTIF_PAYMENT_REFUNDED,
  FIXTURE_NOTIF_REVIEW_REQUESTED,
  FIXTURE_NOTIF_SECURITY_ALERT,
  FIXTURE_NOTIF_VERIFICATION_COMPLETE,
  FIXTURE_NOTIF_SYSTEM,
];

export const FIXTURE_NOTIFICATION_CUSTOMER_B: CustomerNotification = {
  id: 'notif-foreign-001',
  recipientId: FIXTURE_CUSTOMER_B,
  type: 'JOB_CONFIRMED',
  category: 'bookings',
  title: 'Foreign Customer Booking Confirmed',
  message: 'This notification belongs strictly to customer B.',
  isRead: false,
  createdAt: '2026-09-23T10:00:00.000Z',
  readAt: null,
  targetUrl: '/jobs?id=job-cust-b-001',
  referenceCode: 'BBJ-ABJ-2026-0100',
  metadata: { jobId: 'job-cust-b-001' },
};
