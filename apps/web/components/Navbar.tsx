'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShieldCheck,
  Briefcase,
  Menu,
  X,
  UserCheck,
  LayoutDashboard,
} from 'lucide-react';
import { getMockAuthenticatedUser } from '../lib/auth/storage';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  onPostJobClick?: () => void;
  onBecomeWorkerClick?: () => void;
  drawerOpenRef?: React.MutableRefObject<(() => void) | null>;
  hideOnPwa?: boolean;
}

const NAV_LINKS = [
  { href: '/services', label: 'Services', icon: Search },
  { href: '/guarantee', label: 'BukieGuarantee', icon: ShieldCheck },
  { href: '/guarantee#verification', label: 'Verification', icon: UserCheck },
  { href: '/enterprise', label: 'For Business', icon: null },
];

const DRAWER_LINKS = [
  { href: '/services', label: 'Services', icon: Search },
  { href: '/guarantee', label: 'BukieGuarantee', icon: ShieldCheck },
  { href: '/#how-it-works', label: 'How It Works', icon: Briefcase },
  { href: '/guarantee#verification', label: 'Verification', icon: UserCheck },
  { href: '/enterprise', label: 'For Business', icon: Briefcase },
  { href: '/login', label: 'Sign In', icon: UserCheck },
];

// Hash links share a path with their page, so only plain paths can claim the current route.
function isCurrent(pathname: string | null, href: string) {
  if (!pathname || href.includes('#')) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const HEADER_PILL = 'motion-press px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5';
const HEADER_GHOST = `${HEADER_PILL} text-white hover:text-[var(--nav-accent)] drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]`;
const HEADER_OUTLINE = `${HEADER_PILL} text-[var(--nav-accent)] border border-[var(--nav-accent)]/60 bg-white/5 hover:bg-[var(--nav-accent)]/10 hover:border-[var(--nav-accent)]`;

export default function Navbar({ onPostJobClick, onBecomeWorkerClick, drawerOpenRef, hideOnPwa }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [chipShown, setChipShown] = useState(false);
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const settledTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const user = getMockAuthenticatedUser();
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const openDrawer = useCallback(() => {
    setMobileMenuOpen(true);
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = 'hidden';
  }, []);

  if (drawerOpenRef) drawerOpenRef.current = openDrawer;

  const closeDrawer = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setMobileMenuOpen(false);
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    }, 250);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (window.innerWidth < 640) {
        setChipShown(false);
        if (settledTimer.current) clearTimeout(settledTimer.current);
        settledTimer.current = setTimeout(() => {
          setChipShown(y > 40);
          settledTimer.current = null;
        }, 450);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (settledTimer.current) clearTimeout(settledTimer.current);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen, closeDrawer]);

  const navigateTo = (href: string) => {
    closeDrawer();
    const target = href.startsWith('/#') ? document.getElementById(href.slice(2)) : null;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    router.push(href);
  };

  const solid = scrolled || mobileMenuOpen || (hideOnPwa && chipShown);
  const drawerOnly = hideOnPwa && mobileMenuOpen;
  // Only the home hero runs full-bleed under the header; other pages start below it, so a fade would wash out on light backgrounds.
  const overHero = pathname === '/';
  const noop = () => {};
  const doPostJob = onPostJobClick ?? (() => navigateTo('/post-job'));
  const doBecomeWorker = onBecomeWorkerClick;

  if (hideOnPwa) {
    if (!drawerOnly && !solid) return null;
    return (
      <>
        {solid && !drawerOnly && (
          <div className="fixed top-3 right-4 z-50 h-11 w-11 rounded-xl bg-[var(--card-bg)] border border-[var(--lead)] shadow-md flex items-center justify-center pointer-events-auto">
            <button
              ref={triggerRef}
              onClick={() => (mobileMenuOpen ? closeDrawer() : openDrawer())}
              className="motion-press p-2 rounded-lg text-[var(--text-main)] hover:bg-[var(--card-hover)]"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
        {drawerOnly && (
          <>
            <div
              className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-[180ms] ease-[var(--ease-ui-out)] ${visible ? 'opacity-100' : 'opacity-0'}`}
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <DrawerPanel
              visible={visible}
              onClose={closeDrawer}
              onNavigate={navigateTo}
              onPostJob={doPostJob}
              onBecomeWorker={doBecomeWorker}
              isAuthenticated={isAuthenticated}
              pathname={pathname}
            />
          </>
        )}
      </>
    );
  }

  return (
    <>
    {/* Desktop header, never rendered on the PWA home */}
    <header
      className={`fixed top-0 inset-x-0 z-50 w-full text-white transition-all duration-300 pointer-events-auto ${
        solid || !overHero
          ? 'bg-[var(--strip-bg)] border-b border-white/10 dark:border-[var(--lead)] shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)]'
          : 'bg-gradient-to-b from-[var(--strip-bg)]/85 via-[var(--strip-bg)]/50 to-transparent border-b border-transparent'
      }`}
    >
      {/* Main Header Container */}
      <div
        className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between transition-all duration-300 ${
          solid || !overHero ? 'py-2' : 'py-4'
        }`}
      >
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/images/wordmark-banner-2280.png"
            alt="BukieBrainJobs"
            width={228}
            height={68}
            sizes="133px"
            className="hidden sm:block h-10 w-auto rounded-xl object-contain transition-transform duration-[180ms] ease-[var(--ease-ui-out)] group-hover:scale-[1.03]"
            priority
          />
          <Image
            src="/images/logo-icon.png"
            alt="BukieBrainJobs"
            width={40}
            height={40}
            className="sm:hidden object-contain h-10 w-10 rounded-xl"
            priority
          />
        </Link>

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-7 text-sm font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const current = isCurrent(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 py-1 transition-colors hover:text-[var(--nav-accent)] after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-[var(--amber)] after:transition-transform after:duration-200 ${current ? 'after:scale-x-100' : 'after:scale-x-0'}`}
              >
                {Icon && <Icon className="w-4 h-4 text-[var(--nav-accent)]" />}
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden min-w-0 items-center gap-2.5 md:flex">
          <ThemeToggle idPrefix="nav-theme" />
          {/* Secondary action: Become a BrainWorker */}
          {onBecomeWorkerClick ? (
            <button
              onClick={onBecomeWorkerClick}
              className={HEADER_GHOST}
            >
              <UserCheck className="w-3.5 h-3.5 text-[var(--nav-accent)]" />
              Become a BrainWorker
            </button>
          ) : (
            <Link
              href="/brainworker/register"
              className={HEADER_GHOST}
            >
              <UserCheck className="w-3.5 h-3.5 text-[var(--nav-accent)]" />
              Become a BrainWorker
            </Link>
          )}

          {/* Level 2 Secondary: Post a Job */}
          {onPostJobClick ? (
            <button
              onClick={onPostJobClick}
              className={HEADER_OUTLINE}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Post a Job
            </button>
          ) : (
            <Link
              href="/post-job"
              className={HEADER_OUTLINE}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Post a Job
            </Link>
          )}

          {/* Sign In or Dashboard CTA */}
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className={HEADER_OUTLINE}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className={HEADER_GHOST}
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle & Top Theme Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="md:hidden">
            <ThemeToggle idPrefix="mobile-top-theme" />
          </div>
          <button
            ref={triggerRef}
            onClick={() => (mobileMenuOpen ? closeDrawer() : openDrawer())}
            className="motion-press p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 pointer-events-auto"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-in drawer */}
      {mobileMenuOpen && !drawerOnly && (
        <>
          <div
            className={`lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-[180ms] ease-[var(--ease-ui-out)] ${visible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <DrawerPanel
            visible={visible}
            onClose={closeDrawer}
            onNavigate={navigateTo}
            onPostJob={doPostJob}
            onBecomeWorker={doBecomeWorker}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
          />
        </>
      )}
    </header>
    </>
  );
}

function DrawerPanel({
  visible,
  onClose,
  onNavigate,
  onPostJob,
  onBecomeWorker,
  isAuthenticated,
  pathname,
}: {
  pathname: string | null;
  visible: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  onPostJob: () => void;
  onBecomeWorker?: (() => void) | undefined;
  isAuthenticated?: boolean;
}) {
  return (
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className={`lg:hidden fixed top-0 right-0 z-50 h-full w-[300px] max-w-[85vw] bg-[var(--card-bg)] text-[var(--text-main)] border-l border-[var(--lead)] shadow-2xl flex flex-col transition-transform duration-[240ms] ease-[var(--ease-ui-out)] ${visible ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ backgroundColor: 'var(--card-bg)' }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-20 border-b border-[var(--lead)]">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/logo-icon.png"
                  alt="BukieBrainJobs"
                  width={36}
                  height={36}
                  className="object-contain h-9 w-9 rounded-xl"
                  priority
                />
                <span className="font-display font-extrabold text-base tracking-tight text-[var(--text-main)]">
                  Bukie<span className="text-[var(--brand-green)]">BrainJobs</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--text-main)] hover:bg-[var(--tag-bg)]"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Link zone */}
            <nav className="flex flex-col gap-1 px-4 py-5 overflow-y-auto">
              {isAuthenticated && (
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="motion-press flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-bold text-[var(--text-main)] bg-[var(--tag-bg)] hover:bg-[var(--card-hover)] transition-colors mb-1"
                >
                  <LayoutDashboard className="w-[18px] h-[18px] text-[var(--brand-green)]" />
                  Customer Dashboard
                </button>
              )}
              {DRAWER_LINKS.filter(({ href }) => !isAuthenticated || href !== '/login').map(({ href, label, icon: Icon }) => {
                const current = isCurrent(pathname, href);
                return (
                  <button
                    key={label}
                    onClick={() => onNavigate(href)}
                    aria-current={current ? 'page' : undefined}
                    className={`motion-press flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-xl text-[15px] transition-colors hover:bg-[var(--tag-bg)] hover:text-[var(--text-main)] active:bg-[var(--card-hover)] ${current ? 'font-semibold text-[var(--text-main)] bg-[var(--tag-bg)] shadow-[inset_2px_0_0_var(--amber)]' : 'font-medium text-[var(--text-muted)]'}`}
                  >
                    <Icon className="w-[18px] h-[18px] text-[var(--brand-green)]" />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* Action zone */}
            <div className="mt-auto px-5 pb-8 pt-4 space-y-2.5 border-t border-[var(--lead)]">
              <button
                onClick={() => { onClose(); onPostJob?.(); }}
                className="motion-press w-full py-3.5 px-4 text-sm font-semibold text-center text-white bg-[var(--amber)] hover:bg-[var(--amber-hover)] active:bg-[var(--amber-hover)] rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Post a Job
              </button>
              {onBecomeWorker ? (
                <button
                  onClick={() => { onClose(); onBecomeWorker(); }}
                  className="motion-press w-full py-3.5 px-4 text-sm font-semibold text-center text-[var(--text-main)] bg-[var(--tag-bg)] hover:bg-[var(--card-hover)] active:bg-[var(--card-hover)] border border-[var(--lead)] rounded-xl transition-colors block"
                >
                  Become a BrainWorker
                </button>
              ) : (
                <Link
                  href="/brainworker/register"
                  onClick={onClose}
                  className="motion-press w-full py-3.5 px-4 text-sm font-semibold text-center text-[var(--text-main)] bg-[var(--tag-bg)] hover:bg-[var(--card-hover)] active:bg-[var(--card-hover)] border border-[var(--lead)] rounded-xl transition-colors block"
                >
                  Become a BrainWorker
                </Link>
              )}
            </div>
          </aside>
  );
}
