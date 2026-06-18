import React from 'react';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16 px-4 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm font-medium text-gray-500">
          © 2026 BukieBrainJobs. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6">
          <Link href="/about" className="text-sm text-gray-600 hover:text-[#0A192F] transition-colors font-medium">About Us</Link>
          <Link href="/legal/terms" className="text-sm text-gray-600 hover:text-[#0A192F] transition-colors font-medium">Terms of Service</Link>
          <Link href="/legal/privacy" className="text-sm text-gray-600 hover:text-[#0A192F] transition-colors font-medium">Privacy Policy</Link>
          <Link href="/legal/cookies" className="text-sm text-gray-600 hover:text-[#0A192F] transition-colors font-medium">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
