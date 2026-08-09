import React from 'react';
import './globals.css';

export const metadata = {
  title: 'BukieBrainJobs - Nigeria\'s On-Demand Hybrid Service Marketplace',
  description: 'Connect with verified artisans for generator repair, furniture assembly, TV mounting, and home services.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8F9FF] text-[#001A41] font-body min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
