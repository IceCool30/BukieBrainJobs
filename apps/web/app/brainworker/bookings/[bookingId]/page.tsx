// apps/web/app/brainworker/bookings/[bookingId]/page.tsx
// Phase 8 GREEN: BrainWorker Booking Detail Route
// Governed by: BW-004-ARCH v0.2 section 13 and BW-004-TEST-PLAN section 2 (Suite 8: INT-001 to INT-011)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, LogOut, AlertTriangle } from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../../lib/auth/storage';
import type { AuthUser } from '../../../../lib/auth/types';
import { getBrainWorkerOperationsRepository } from '../../../../lib/brainworker/catalog/repository';
import type { BrainWorkerOperationalProfile } from '../../../../lib/brainworker/catalog/types';
import { getBrainWorkerBookingsRepository } from '../../../../lib/brainworker/bookings/repository';
import type { ProviderBookingDetail } from '../../../../lib/brainworker/bookings/types';
import { BookingDetailView } from '../../../../components/brainworker/bookings/BookingDetailView';

export interface BookingDetailPageProps {
  params: Promise<{ bookingId: string }>;
}

export default function BrainWorkerBookingDetailPage(
  props: BookingDetailPageProps
): React.ReactElement {
  const router = useRouter();
  const routeParams = useParams();
  const [resolvedBookingId, setResolvedBookingId] = useState<string>(() => {
    return (routeParams?.bookingId as string) || '';
  });

  const [user, setUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());
  const [operationalProfile, setOperationalProfile] =
    useState<BrainWorkerOperationalProfile | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [bookingDetail, setBookingDetail] = useState<ProviderBookingDetail | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);

  // Unwrap params Promise if provided
  useEffect(() => {
    let isSubscribed = true;
    if (props?.params) {
      Promise.resolve(props.params).then((p) => {
        if (isSubscribed && p?.bookingId) {
          setResolvedBookingId(p.bookingId);
        }
      });
    }
    return () => {
      isSubscribed = false;
    };
  }, [props?.params]);

  useEffect(() => {
    let isSubscribed = true;
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    const targetBookingId = resolvedBookingId || (routeParams?.bookingId as string) || '';

    // Guard 1: Unauthenticated -> redirect to /login
    if (!currentUser) {
      router.replace(
        `/login?redirect=/brainworker/bookings/${targetBookingId}`
      );
      return;
    }

    // Guard 2: Non-BrainWorker -> fail-closed boundary
    if (currentUser.role !== 'brainworker') {
      return;
    }

    // Guard 3: Unapproved BrainWorker -> redirect to verification status
    if (!currentUser.isBrainWorkerApproved) {
      router.replace('/brainworker/verification-status');
      return;
    }

    // Guard 4: Query operational profile for setup completeness check
    const opsRepo = getBrainWorkerOperationsRepository();
    opsRepo
      .getOperationalProfile(currentUser.id)
      .then((profile) => {
        if (!isSubscribed) return;
        setOperationalProfile(profile);
        setIsProfileLoaded(true);

        if (!profile || !profile.isComplete) {
          setIsLoadingBooking(false);
          return;
        }

        // Fetch booking with strict tenant binding
        if (!targetBookingId) {
          setIsNotFound(true);
          setIsLoadingBooking(false);
          return;
        }

        const bookingsRepo = getBrainWorkerBookingsRepository();
        bookingsRepo
          .getBooking(currentUser.id, targetBookingId)
          .then((detail) => {
            if (!isSubscribed) return;
            if (!detail) {
              setIsNotFound(true);
            } else {
              setBookingDetail(detail);
            }
            setIsLoadingBooking(false);
          })
          .catch(() => {
            if (!isSubscribed) return;
            setIsNotFound(true);
            setIsLoadingBooking(false);
          });
      })
      .catch(() => {
        if (!isSubscribed) return;
        setIsProfileLoaded(true);
        setIsLoadingBooking(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [router, resolvedBookingId, routeParams?.bookingId]);

  // Customer Account / Non-BrainWorker Fail-Closed Boundary
  if (user && user.role !== 'brainworker') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-800">
            {user.role === 'customer' ? 'Customer Account Detected' : 'Unauthorized Access'}
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The BrainWorker workspace is strictly reserved for verified service providers.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#001A41] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#002661] transition-colors"
          >
            {user.role === 'customer' ? 'Return to Customer Dashboard' : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    setMockAuthenticatedUser(null);
    router.push('/login');
  };

  const effectiveBookingId = resolvedBookingId || (routeParams?.bookingId as string) || '';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-200">
      {/* Top Navigation */}
      <header className="bg-[var(--card-bg)] border-b border-[var(--lead)] sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/brainworker/bookings"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-main)] hover:opacity-80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Bookings</span>
            </Link>
            <span className="text-[var(--rule)]">|</span>
            <span className="font-black text-xl tracking-tight text-[var(--text-main)] font-display">BukieBrainJobs</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-green)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-green)]" />
              <span>Verified Provider</span>
            </span>
          </div>

          {user && user.role === 'brainworker' && user.isBrainWorkerApproved && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-[var(--text-main)]">{user.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{user.email || user.phone}</div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-red-500 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Loading state */}
        {(!user || !isProfileLoaded || (isLoadingBooking && !isNotFound && !operationalProfile?.isComplete === false)) && (
          <div className="p-12 text-center bg-[var(--card-bg)] text-[var(--text-main)] rounded-2xl border border-[var(--lead)] shadow-sm">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--amber)] border-t-transparent" />
            <p className="mt-3 text-sm text-[var(--text-muted)]">Loading booking details...</p>
          </div>
        )}

        {/* Incomplete Operational Profile Banner */}
        {user && isProfileLoaded && operationalProfile && !operationalProfile.isComplete && (
          <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--lead)] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-[var(--amber)]">
                  <AlertTriangle className="h-3.5 w-3.5 text-[var(--amber)]" />
                  <span>Action Needed</span>
                </div>
                <h2 className="text-lg font-bold text-[var(--text-main)]">
                  Complete Your Provider Setup to Manage Bookings
                </h2>
                <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                  Before you can access booking details, configure your trade services, hourly rates, operating hours, and coverage zones.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/brainworker/services"
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--amber)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--amber-hover)] transition-colors"
                >
                  Configure Services & Rates
                </Link>
                <Link
                  href="/brainworker/availability"
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--tag-bg)] border border-[var(--lead)] px-4 py-2.5 text-sm font-semibold text-[var(--text-main)] shadow-sm hover:bg-[var(--card-hover)] transition-colors"
                >
                  Set Hours & Coverage
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Not Found or Access Restricted Boundary */}
        {user && isProfileLoaded && isNotFound && (
          <div className="p-8 bg-[var(--card-bg)] rounded-2xl border border-red-500/20 text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-semibold text-red-500">
              Notice
            </div>
            <h2 className="text-xl font-bold text-[var(--text-main)]">
              Booking Not Found or Access Restricted
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
              The requested booking does not exist or you do not have permission to view its operational dispatch sheet.
            </p>
            <Link
              href="/brainworker/bookings"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--amber)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--amber-hover)] transition-colors"
            >
              Return to Bookings
            </Link>
          </div>
        )}

        {/* Populated Booking Detail View */}
        {user && isProfileLoaded && operationalProfile && operationalProfile.isComplete && bookingDetail && !isNotFound && (
          <BookingDetailView
            brainWorkerId={user.id}
            bookingId={effectiveBookingId}
            repository={getBrainWorkerBookingsRepository()}
            initialDetail={bookingDetail}
            onBack={() => router.push('/brainworker/bookings')}
          />
        )}
      </main>
    </div>
  );
}
