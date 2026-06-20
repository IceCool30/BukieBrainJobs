import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Browse High-Paying Jobs, Tasks & Freelance Gigs in Nigeria',
  description: 'Search hundreds of verified local jobs, freelance tasks, and artisan gigs across Lagos, Abuja, Port Harcourt and throughout Nigeria. Find your next earning opportunity today.',
  keywords: ['latest jobs in Nigeria', 'artisan jobs', 'remote work Nigeria', 'find task jobs', 'freelance projects Nigeria', 'urgent jobs near me', 'plumber jobs', 'tech jobs Nigeria'],
  openGraph: {
    title: 'Browse High-Paying Jobs & Freelance Gigs in Nigeria | BukieBrainJobs',
    description: 'Search hundreds of verified local jobs, freelance tasks, and artisan gigs across Lagos, Abuja, Port Harcourt and throughout Nigeria. Find your next earning opportunity today.',
    url: 'https://bukiebrainjobs.com/jobs',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse High-Paying Jobs & Freelance Gigs in Nigeria | BukieBrainJobs',
    description: 'Find verified local jobs, tasks, and freelance projects near you in Nigeria.',
  }
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
