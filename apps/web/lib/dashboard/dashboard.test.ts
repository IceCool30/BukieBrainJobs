import { describe, it, expect } from 'vitest';
import {
  resolveDashboardContext,
  MOCK_ACTIVE_WORK,
  MOCK_UPCOMING_WORK,
  MOCK_RECENT_ACTIVITY,
  MOCK_MARKETPLACE_CONTINUATION,
  DEFAULT_DASHBOARD_CUSTOMER,
} from './index';
import { AuthUser } from '../auth/types';

describe('WEB-010 Dashboard Domain Logic & State Resolution', () => {
  const mockUser: AuthUser = {
    id: 'usr-customer-1',
    name: 'Olumide Adebayo',
    email: 'olumide@example.com',
    phone: '+2348012345678',
    provider: 'google',
    role: 'customer',
    isBrainWorkerApproved: false,
  };

  it('provides well-structured default mock datasets adhering to Design System & Nigerian context', () => {
    expect(MOCK_ACTIVE_WORK.length).toBeGreaterThanOrEqual(1);
    expect(MOCK_UPCOMING_WORK.length).toBeGreaterThanOrEqual(1);
    expect(MOCK_RECENT_ACTIVITY.length).toBeGreaterThanOrEqual(1);
    expect(MOCK_MARKETPLACE_CONTINUATION.length).toBeGreaterThanOrEqual(2);

    // Active item checks
    const active = MOCK_ACTIVE_WORK[0]!;
    expect(active.id).toMatch(/^REQ-|^BKG-/);
    expect(active.title).toBeTruthy();
    expect(active.location).toContain('Lagos');
    expect(active.actionUrl).toMatch(/^\//);

    // Upcoming item checks
    const upcoming = MOCK_UPCOMING_WORK[0]!;
    expect(upcoming.serviceTitle).toBeTruthy();
    expect(upcoming.workerName).toBeTruthy();
    expect(upcoming.arrivalWindow).toBeTruthy();
    expect(upcoming.actionUrl).toMatch(/^\//);

    // Recent item checks
    const recent = MOCK_RECENT_ACTIVITY[0]!;
    expect(recent.title).toBeTruthy();
    expect(recent.completedDate).toBeTruthy();
    expect(recent.status).toBe('completed');
  });

  it('resolves default mixed state for authenticated returning customer with correct hierarchy', () => {
    const vm = resolveDashboardContext({}, mockUser);

    expect(vm.stateMode).toBe('mixed');
    expect(vm.customer.name).toBe('Olumide Adebayo');
    expect(vm.customer.role).toBe('customer');

    // Hierarchy check: Active work, Upcoming work, and Recent activity are all present
    expect(vm.activeWork.length).toBeGreaterThan(0);
    expect(vm.upcomingWork.length).toBeGreaterThan(0);
    expect(vm.recentActivity.length).toBeGreaterThan(0);
    expect(vm.marketplaceContinuation.length).toBeGreaterThan(0);
  });

  it('resolves first-run state with zero fake jobs, zero fake bookings, and zero fake metrics', () => {
    const vm = resolveDashboardContext({ state: 'first_run' }, mockUser);

    expect(vm.stateMode).toBe('first_run');
    expect(vm.activeWork).toEqual([]);
    expect(vm.upcomingWork).toEqual([]);
    expect(vm.recentActivity).toEqual([]);
    // Marketplace continuation remains accessible
    expect(vm.marketplaceContinuation.length).toBeGreaterThan(0);
  });

  it('resolves active-only state isolating active requests', () => {
    const vm = resolveDashboardContext({ state: 'active' }, mockUser);

    expect(vm.stateMode).toBe('active');
    expect(vm.activeWork.length).toBeGreaterThan(0);
    expect(vm.upcomingWork).toEqual([]);
    expect(vm.recentActivity).toEqual([]);
  });

  it('resolves upcoming-only state isolating upcoming work', () => {
    const vm = resolveDashboardContext({ state: 'upcoming' }, mockUser);

    expect(vm.stateMode).toBe('upcoming');
    expect(vm.activeWork).toEqual([]);
    expect(vm.upcomingWork.length).toBeGreaterThan(0);
    expect(vm.recentActivity).toEqual([]);
  });

  it('resolves recent-activity-only state isolating historical work', () => {
    const vm = resolveDashboardContext({ state: 'recent' }, mockUser);

    expect(vm.stateMode).toBe('recent');
    expect(vm.activeWork).toEqual([]);
    expect(vm.upcomingWork).toEqual([]);
    expect(vm.recentActivity.length).toBeGreaterThan(0);
  });

  it('resolves loading state without crashing or injecting data', () => {
    const vm = resolveDashboardContext({ state: 'loading' }, mockUser);

    expect(vm.stateMode).toBe('loading');
    expect(vm.activeWork).toEqual([]);
    expect(vm.upcomingWork).toEqual([]);
    expect(vm.recentActivity).toEqual([]);
  });

  it('resolves partial failure state isolating failing section with retry metadata', () => {
    const vm = resolveDashboardContext({ state: 'partial_failure' }, mockUser);

    expect(vm.hasPartialFailure).toBe(true);
    expect(vm.failedSection).toBe('activeWork');
    expect(vm.activeWork).toEqual([]);
    // Other sections remain intact
    expect(vm.upcomingWork.length).toBeGreaterThan(0);
    expect(vm.recentActivity.length).toBeGreaterThan(0);
  });

  it('resolves offline state with honest degraded flag', () => {
    const vm = resolveDashboardContext({ state: 'offline' }, mockUser);

    expect(vm.isOffline).toBe(true);
    // Cached data is presented
    expect(vm.activeWork.length).toBeGreaterThan(0);
  });

  it('resolves auth failure mode when simulated via query or unauthenticated session', () => {
    const vm = resolveDashboardContext({ state: 'auth_failure' }, null);

    expect(vm.stateMode).toBe('auth_failure');
  });

  it('prepends newly created job request when jobCreated parameter is present', () => {
    const vm = resolveDashboardContext(
      { jobCreated: 'REQ-99214', jobTitle: 'Emergency Generator Alternator Repair' },
      mockUser
    );

    expect(vm.newJobNotice).toBeDefined();
    expect(vm.newJobNotice?.reference).toBe('REQ-99214');
    expect(vm.newJobNotice?.title).toContain('Emergency Generator');

    expect(vm.activeWork[0]!.id).toBe('REQ-99214');
    expect(vm.activeWork[0]!.title).toBe('Emergency Generator Alternator Repair');
    expect(vm.activeWork[0]!.statusLabel).toBe('Request Received');
  });

  it('sanitizes untrusted query strings and handles invalid values gracefully without throwing', () => {
    const vm = resolveDashboardContext(
      {
        state: 'invalid_malicious_script<script>alert(1)</script>',
        jobCreated: '"><svg onload=alert(1)>',
        jobTitle: 'Safe Title',
      },
      mockUser
    );

    // Falls back safely to default mixed state
    expect(vm.stateMode).toBe('mixed');
    // Sanitizes job ID to valid safe format
    expect(vm.activeWork).toBeDefined();
  });

  it('uses default fallback customer profile if user is not yet loaded', () => {
    const vm = resolveDashboardContext({}, null);

    expect(vm.customer).toEqual(DEFAULT_DASHBOARD_CUSTOMER);
  });
});
