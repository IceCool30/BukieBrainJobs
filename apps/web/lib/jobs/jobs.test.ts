import { describe, it, expect } from 'vitest';
import {
  normalizeFilterView,
  normalizeActivityId,
  resolveJobsContext,
  MOCK_CUSTOMER_ACTIVITIES,
  DEFAULT_JOBS_CUSTOMER,
} from './index';
import { PreservedJobDraft } from '../auth/types';

describe('WEB-011 Customer Jobs & Bookings Domain & Filtering (TDD)', () => {
  describe('normalizeFilterView', () => {
    it('defaults to "all" for null or undefined input', () => {
      expect(normalizeFilterView(null)).toBe('all');
      expect(normalizeFilterView(undefined as unknown as string)).toBe('all');
      expect(normalizeFilterView('')).toBe('all');
    });

    it('parses valid filter views correctly', () => {
      expect(normalizeFilterView('all')).toBe('all');
      expect(normalizeFilterView('active')).toBe('active');
      expect(normalizeFilterView('upcoming')).toBe('upcoming');
      expect(normalizeFilterView('past')).toBe('past');
    });

    it('handles case-insensitivity and whitespace', () => {
      expect(normalizeFilterView('  ACTIVE  ')).toBe('active');
      expect(normalizeFilterView('Upcoming')).toBe('upcoming');
      expect(normalizeFilterView('PAST')).toBe('past');
      expect(normalizeFilterView('ALL')).toBe('all');
    });

    it('falls back safely to "all" on unsupported/invalid filter parameters', () => {
      expect(normalizeFilterView('cancelled')).toBe('all');
      expect(normalizeFilterView('admin')).toBe('all');
      expect(normalizeFilterView('completed')).toBe('all');
      expect(normalizeFilterView('<script>')).toBe('all');
    });
  });

  describe('normalizeActivityId', () => {
    it('normalizes valid activity IDs', () => {
      expect(normalizeActivityId('REQ-84920')).toBe('REQ-84920');
      expect(normalizeActivityId('BKG-77210')).toBe('BKG-77210');
      expect(normalizeActivityId('  REQ-51829  ')).toBe('REQ-51829');
    });

    it('returns null for empty or invalid inputs', () => {
      expect(normalizeActivityId(null)).toBeNull();
      expect(normalizeActivityId('')).toBeNull();
      expect(normalizeActivityId('   ')).toBeNull();
      expect(normalizeActivityId('invalid/characters!')).toBeNull();
    });
  });

  describe('MOCK_CUSTOMER_ACTIVITIES Data Quality & Separation of Type vs Status', () => {
    it('contains valid mock activities distinguishing Type and Status', () => {
      expect(MOCK_CUSTOMER_ACTIVITIES.length).toBeGreaterThan(0);

      MOCK_CUSTOMER_ACTIVITIES.forEach((activity) => {
        // Type must be either 'job_request' or 'booking'
        expect(['job_request', 'booking']).toContain(activity.type);

        // Status must be one of the approved statuses
        expect([
          'request_received',
          'awaiting_progress',
          'scheduled',
          'in_progress',
          'completed',
          'cancelled',
        ]).toContain(activity.status);

        // Must have required fields
        expect(activity.id).toBeDefined();
        expect(activity.title).toBeDefined();
        expect(activity.statusLabel).toBeDefined();
        expect(activity.location).toBeDefined();
        expect(activity.schedule).toBeDefined();
        expect(activity.createdAt).toBeDefined();
      });
    });

    it('has both job_requests and bookings represented', () => {
      const jobRequests = MOCK_CUSTOMER_ACTIVITIES.filter((a) => a.type === 'job_request');
      const bookings = MOCK_CUSTOMER_ACTIVITIES.filter((a) => a.type === 'booking');

      expect(jobRequests.length).toBeGreaterThan(0);
      expect(bookings.length).toBeGreaterThan(0);
    });
  });

  describe('resolveJobsContext view model generation', () => {
    it('resolves default view model with "all" filter', () => {
      const searchParams = new URLSearchParams();
      const vm = resolveJobsContext(searchParams, null, null);

      expect(vm.currentFilter).toBe('all');
      expect(vm.customer.name).toBe(DEFAULT_JOBS_CUSTOMER.name);
      expect(vm.activities.length).toBe(MOCK_CUSTOMER_ACTIVITIES.length);
      expect(vm.allActivities.length).toBe(MOCK_CUSTOMER_ACTIVITIES.length);
      expect(vm.totalCount).toBe(MOCK_CUSTOMER_ACTIVITIES.length);
      expect(vm.activeActivities.length).toBeGreaterThan(0);
      expect(vm.upcomingActivities.length).toBeGreaterThan(0);
      expect(vm.pastActivities.length).toBeGreaterThan(0);
      expect(vm.availableFilters).toEqual(['all', 'active', 'upcoming', 'past']);
    });

    it('resolves "active" filter returning active work while preserving totalCount and allActivities', () => {
      const searchParams = new URLSearchParams('view=active');
      const vm = resolveJobsContext(searchParams, null, null);

      expect(vm.currentFilter).toBe('active');
      expect(vm.activities.length).toBe(vm.activeActivities.length);
      expect(vm.totalCount).toBe(MOCK_CUSTOMER_ACTIVITIES.length);
      expect(vm.allActivities.length).toBe(MOCK_CUSTOMER_ACTIVITIES.length);
      vm.activities.forEach((act) => {
        expect(['in_progress', 'awaiting_progress', 'request_received']).toContain(act.status);
      });
    });

    it('resolves "upcoming" filter returning upcoming work only', () => {
      const searchParams = new URLSearchParams('view=upcoming');
      const vm = resolveJobsContext(searchParams, null, null);

      expect(vm.currentFilter).toBe('upcoming');
      expect(vm.activities.length).toBe(vm.upcomingActivities.length);
      vm.activities.forEach((act) => {
        expect(['scheduled']).toContain(act.status);
      });
    });

    it('resolves "past" filter returning completed and cancelled work only', () => {
      const searchParams = new URLSearchParams('view=past');
      const vm = resolveJobsContext(searchParams, null, null);

      expect(vm.currentFilter).toBe('past');
      expect(vm.activities.length).toBe(vm.pastActivities.length);
      vm.activities.forEach((act) => {
        expect(['completed', 'cancelled']).toContain(act.status);
      });
    });

    it('deep links to selected activity by valid id', () => {
      const searchParams = new URLSearchParams('id=REQ-84920');
      const vm = resolveJobsContext(searchParams, null, null);

      expect(vm.selectedActivityId).toBe('REQ-84920');
      expect(vm.selectedActivity).toBeDefined();
      expect(vm.selectedActivity?.id).toBe('REQ-84920');
      expect(vm.selectedActivity?.title).toContain('Inverter');
    });

    it('handles unknown or invalid id gracefully without crashing', () => {
      const searchParams = new URLSearchParams('id=NON-EXISTENT-9999');
      const vm = resolveJobsContext(searchParams, null, null);

      expect(vm.selectedActivityId).toBe('NON-EXISTENT-9999');
      expect(vm.selectedActivity).toBeUndefined();
    });

    it('supports combined view filter and selected id', () => {
      const searchParams = new URLSearchParams('view=upcoming&id=BKG-63102');
      const vm = resolveJobsContext(searchParams, null, null);

      expect(vm.currentFilter).toBe('upcoming');
      expect(vm.selectedActivityId).toBe('BKG-63102');
      expect(vm.selectedActivity).toBeDefined();
      expect(vm.selectedActivity?.id).toBe('BKG-63102');
    });

    it('integrates preserved job draft from WEB-009 seamlessly into active work', () => {
      const preservedDraft: PreservedJobDraft = {
        title: 'Generator Soundproof Enclosure Construction',
        category: 'welding',
        description: 'Construct custom acoustic sheet metal enclosure for 10kVA diesel generator.',
        city: 'Lagos',
        streetAddress: '14 Adeleke Street, Allen',
        landmark: 'Near Alade Market',
        budget: '₦85,000',
      };

      const searchParams = new URLSearchParams();
      const vm = resolveJobsContext(searchParams, null, preservedDraft);

      expect(vm.newJobNotice).toBeDefined();
      expect(vm.newJobNotice?.reference).toBe('REQ-DRAFT');
      expect(vm.activeActivities[0]?.id).toBe('REQ-DRAFT');
      expect(vm.activeActivities[0]?.status).toBe('request_received');
      expect(vm.activeActivities[0]?.statusLabel).toBe('Request Received');
      expect(vm.activeActivities[0]?.title).toBe('Generator Soundproof Enclosure Construction');
    });

    it('handles deterministic state overrides (first_run, partial_failure, offline, auth_failure)', () => {
      const firstRunParams = new URLSearchParams('state=first_run');
      const firstRunVm = resolveJobsContext(firstRunParams, null, null);
      expect(firstRunVm.stateMode).toBe('first_run');
      expect(firstRunVm.activities).toEqual([]);

      const partialParams = new URLSearchParams('state=partial_failure');
      const partialVm = resolveJobsContext(partialParams, null, null);
      expect(partialVm.hasPartialFailure).toBe(true);
      expect(partialVm.failedSection).toBe('activeActivities');

      const offlineParams = new URLSearchParams('state=offline');
      const offlineVm = resolveJobsContext(offlineParams, null, null);
      expect(offlineVm.isOffline).toBe(true);
      expect(offlineVm.stateMode).toBe('offline');

      const authParams = new URLSearchParams('state=auth_failure');
      const authVm = resolveJobsContext(authParams, null, null);
      expect(authVm.stateMode).toBe('auth_failure');
    });
  });
});
