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
  title: 'BukieBrainJobs | Find trusted local BrainWorkers',
  description:
    "Explore local service categories, prepare booking details, and find flexible work with BukieBrainJobs.",
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }, { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/apple-touch-icon-180x180.png', sizes: '180x180' }],
    shortcut: [{ url: '/icons/icon-512x512.png' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'BukieBrainJobs | Find trusted local BrainWorkers',
    description: "Explore local service categories and flexible work with BukieBrainJobs.",
    images: ['/images/og-banner-1200x630.png'],
    type: 'website',
    locale: 'en_NG',
    siteName: 'BukieBrainJobs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BukieBrainJobs | Find trusted local BrainWorkers',
    description: "Explore local service categories and flexible work with BukieBrainJobs.",
    images: ['/images/og-banner-1200x630.png'],
  },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://bukie-brain-jobs.vercel.app/#organization',
      name: 'BukieBrainJobs',
      url: 'https://bukie-brain-jobs.vercel.app',
      logo: 'https://bukie-brain-jobs.vercel.app/images/logo-icon.png',
      description: "Explore local service categories and flexible work with BukieBrainJobs.",
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+234-800-BUKIE-JOBS',
        contactType: 'customer support',
        areaServed: 'NG',
        availableLanguage: 'en',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://bukie-brain-jobs.vercel.app/#website',
      url: 'https://bukie-brain-jobs.vercel.app',
      name: 'BukieBrainJobs',
      publisher: {
        '@id': 'https://bukie-brain-jobs.vercel.app/#organization',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className="min-h-screen bg-[#f8f9ff] font-sans text-[#0b1c30] antialiased">
        {children}
      </body>
    </html>
  );
}
