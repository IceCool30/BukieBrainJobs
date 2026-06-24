import type { Metadata, Viewport } from 'next';
import './globals.css'; // Global styles

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__SUPABASE_URL__ = ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || '')};
              window.__SUPABASE_ANON_KEY__ = ${JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')};
              
              // Handle and suppress cross-origin "Script error." events that are outside our control
              window.onerror = function(message, source, lineno, colno, error) {
                if (message && (message.toString().indexOf('Script error') > -1 || message.toString().indexOf('script error') > -1)) {
                  console.warn('Suppressed cross-origin Script error:', message);
                  return true; // Prevent default browser error reporting
                }
                return false;
              };
              
              window.addEventListener('error', function(event) {
                if (event.message && (event.message.indexOf('Script error') > -1 || event.message.indexOf('script error') > -1)) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }, true);

              window.addEventListener('unhandledrejection', function(event) {
                if (event.reason && event.reason.message && (event.reason.message.indexOf('Script error') > -1 || event.reason.message.indexOf('script error') > -1)) {
                  event.preventDefault();
                }
              });
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
