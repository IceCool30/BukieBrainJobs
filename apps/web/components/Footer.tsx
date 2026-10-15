import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PhoneCall, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[var(--strip-bg)] text-[var(--strip-text)] border-t border-white/10 dark:border-[var(--lead)] pt-16 pb-12 text-sm transition-colors duration-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10 dark:border-[var(--lead)]">
          {/* Brand Overview Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--strip-bg)]"
              aria-label="BukieBrainJobs home"
            >
              <Image
                src="/images/wordmark-banner-2280.png"
                alt="BukieBrainJobs"
                width={150}
                height={45}
                sizes="150px"
                className="h-auto w-[150px] rounded-xl object-contain"
              />
            </Link>
          </div>

          {/* Column 1: Our Services */}
          <div>
            <h3 className="font-display font-semibold text-white dark:text-[var(--text-main)] text-sm mb-4">Explore services</h3>
            <ul className="space-y-2.5 text-xs text-[var(--strip-text)]">
              <li><Link href="/services/generator" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">Generator services</Link></li>
              <li><Link href="/services/ac" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">Air-conditioning services</Link></li>
              <li><Link href="/services/plumbing" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">Plumbing services</Link></li>
              <li><Link href="/services/electrical" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">Electrical and solar services</Link></li>
              <li><Link href="/services/tv-mounting" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">TV and satellite services</Link></li>
              <li><Link href="/services/moving" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">Moving and relocation</Link></li>
            </ul>
          </div>

          {/* Column 2: Trust and Safety */}
          <div>
            <h3 className="font-display font-semibold text-white dark:text-[var(--text-main)] text-sm mb-4">Helpful links</h3>
            <ul className="space-y-2.5 text-xs text-[var(--strip-text)]">
              <li><Link href="/#how-it-works" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">How booking works</Link></li>
              <li><Link href="/guarantee" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">BukieGuarantee</Link></li>
              <li><Link href="/brainworker/register" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">Become a BrainWorker</Link></li>
              <li><Link href="/#faq" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 3: Business and Support */}
          <div>
            <h3 className="font-display font-semibold text-white dark:text-[var(--text-main)] text-sm mb-4">Business and support</h3>
            <ul className="space-y-2.5 text-xs text-[var(--strip-text)]">
              <li><Link href="/enterprise" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">For business</Link></li>
              <li><a href="mailto:support@bukiebrainjobs.ng" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">Contact support</a></li>
              <li className="flex items-center gap-1.5 pt-1 text-[var(--strip-text)]">
                <PhoneCall className="w-3.5 h-3.5 text-[var(--brand-green)]" />
                +234 800-BUKIE-JOBS
              </li>
              <li className="flex items-center gap-1.5 text-[var(--strip-text)]">
                <Mail className="w-3.5 h-3.5 text-[var(--brand-green)]" />
                support@bukiebrainjobs.ng
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright and Legal Links */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[var(--strip-text)] gap-4">
          <div>
            &copy; 2026 BukieBrainJobs Platform Limited. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white dark:hover:text-[var(--text-main)] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
