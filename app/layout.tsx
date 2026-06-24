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
              window.addEventListener('error', function(event) {
                var msg = event.message || '';
                var isScriptError = (
                  msg.indexOf('Script error') > -1 || 
                  msg.indexOf('script error') > -1 ||
                  msg === 'Script error.'
                );
                if (isScriptError) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                  event.stopPropagation();
                  console.warn('Intercepted and suppressed cross-origin error event:', event);
                }
              }, true);

              window.onerror = function(message, source, lineno, colno, error) {
                var msg = message ? message.toString() : '';
                if (msg.indexOf('Script error') > -1 || msg.indexOf('script error') > -1) {
                  console.warn('Suppressed cross-origin Script error via onerror:', message);
                  return true; // Prevent default browser error reporting
                }
                return false;
              };

              window.addEventListener('unhandledrejection', function(event) {
                var msg = (event.reason && (event.reason.message || event.reason.toString())) || '';
                if (msg.indexOf('Script error') > -1 || msg.indexOf('script error') > -1) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                  event.stopPropagation();
                }
              }, true);
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
