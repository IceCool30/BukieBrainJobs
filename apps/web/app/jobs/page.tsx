import { Suspense } from 'react';
import type { Metadata } from 'next';
import JobsScreen from '../../components/jobs/JobsScreen';

export const metadata: Metadata = {
  title: 'My Jobs & Activities | BukieBrainJobs',
  description: 'Track and manage your service requests, bookings, and active jobs.',
  robots: { index: false, follow: false },
};

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-[var(--bg)]"
          aria-busy="true"
          aria-label="Loading jobs and activities"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--amber)] border-t-transparent" />
        </div>
      }
    >
      <JobsScreen />
    </Suspense>
  );
}
