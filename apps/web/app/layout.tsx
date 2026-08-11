import React from 'react';
import './globals.css';

export const metadata = {
  title: 'BukieBrainJobs | Find trusted local professionals',
  description: 'Find trusted Nigerian professionals for home, business and everyday services.',
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
