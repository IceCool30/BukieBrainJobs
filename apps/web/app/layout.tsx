import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#001A41',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://bukie-brain-jobs.vercel.app'),
  title: 'BukieBrainJobs | Find trusted local professionals',
  description:
    "Nigeria's premier verified marketplace connecting homeowners and businesses with background-checked artisan BrainWorkers. Escrow-protected payments via Paystack and Flutterwave.",
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon-180x180.png', sizes: '180x180' }],
    shortcut: [{ url: '/icons/icon-512x512.png' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'BukieBrainJobs | Find trusted local professionals',
    description: "Nigeria's verified marketplace for vetted artisans. Escrow-protected payments.",
    images: ['/images/og-banner-1200x630.png'],
    type: 'website',
    locale: 'en_NG',
    siteName: 'BukieBrainJobs',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8f9ff] font-sans text-[#0b1c30] antialiased">
        {children}
      </body>
    </html>
  );
}
