import { Suspense } from 'react';
import type { Metadata } from 'next';
import DashboardScreen from '../../components/dashboard/DashboardScreen';

export const metadata: Metadata = {
  title: 'Customer Dashboard | BukieBrainJobs',
  description: 'Manage your active service requests, matching results, and bookings.',
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-[var(--bg)] flex items-center justify-center"
          aria-busy="true"
          aria-label="Loading dashboard"
        >
          <div className="h-8 w-8 rounded-full border-2 border-[var(--amber)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <DashboardScreen />
    </Suspense>
  );
}
