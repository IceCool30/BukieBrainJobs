import type { Metadata, Viewport } from 'next';
import './globals.css'; // Global styles
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { PushNotificationManager } from '@/components/PushNotificationManager';

export const metadata: Metadata = {
  title: {
    template: '%s | BukieBrainJobs',
    default: 'BukieBrainJobs - Find verified local artisans & freelancers in Nigeria',
  },
  description: 'The premier platform to find trusted workers, artisans, and remote freelancers in Nigeria. Hire plumbers, electricians, developers, and more instantly across Lagos, Abuja, and your LGA.',
  keywords: ['jobs in Nigeria', 'hire artisans Nigeria', 'freelance jobs Nigeria', 'plumbers in Lagos', 'electricians in Abuja', 'remote tech jobs Nigeria', 'hire skilled workers Nigeria', 'BukieBrainJobs', 'find work near me', 'local jobs Nigeria'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BukieBrainJobs',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://bukiebrainjobs.com',
    siteName: 'BukieBrainJobs',
    title: 'BukieBrainJobs - Find verified local artisans & freelancers in Nigeria',
    description: 'The premier platform to find trusted workers, artisans, and remote freelancers in Nigeria. Hire plumbers, electricians, developers, and more instantly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BukieBrainJobs - Find verified local artisans & freelancers in Nigeria',
    description: 'The premier platform to find trusted workers, artisans, and remote freelancers in Nigeria.',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
        <PwaInstallPrompt />
        <PushNotificationManager />
      </body>
    </html>
  );
}
