import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages | BukieBrainJobs',
  description: 'Manage active communications, updates, and service coordination with verified BrainWorkers.',
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
