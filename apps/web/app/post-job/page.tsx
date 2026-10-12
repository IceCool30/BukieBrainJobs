import { Suspense } from 'react';
import type { Metadata } from 'next';
import PostJobScreen from '../../components/post-job/PostJobScreen';

export const metadata: Metadata = {
  title: 'Post a Job & Receive Quotes | BukieBrainJobs',
  description: 'Describe your project or maintenance needs and receive proposals from verified Nigerian BrainWorkers.',
  robots: { index: false, follow: false },
};

export default function PostJobPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center bg-[var(--bg)]"
          aria-busy="true"
          aria-label="Loading job posting form"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--amber)] border-t-transparent" />
        </div>
      }
    >
      <PostJobScreen />
    </Suspense>
  );
}

