import { describe, expect, it } from 'vitest';
import {
  resolveJobPostingContext,
  isValidSpecificDate,
  generateJobReference,
  buildPostJobReturnUrl,
  SCHEDULE_OPTIONS,
  ARRIVAL_WINDOWS,
  JOB_TYPES,
} from './index';

describe('apps/web/lib/post-job helpers', () => {
  describe('SCHEDULE_OPTIONS & CONSTANTS', () => {
    it('has the approved schedule choices', () => {
      expect(SCHEDULE_OPTIONS).toContain('Urgent / Today');
      expect(SCHEDULE_OPTIONS).toContain('Tomorrow');
      expect(SCHEDULE_OPTIONS).toContain('Flexible / Within a week');
      expect(SCHEDULE_OPTIONS).toContain('Specific Date');
      expect(SCHEDULE_OPTIONS.length).toBe(4);
    });

    it('has the approved job types', () => {
      expect(JOB_TYPES).toContain('specific_service');
      expect(JOB_TYPES).toContain('broader_project');
    });

    it('has arrival window choices', () => {
      expect(ARRIVAL_WINDOWS.length).toBe(4);
    });
  });

  describe('generateJobReference', () => {
    it('generates a simulated reference code with REQ- prefix and 5 digits', () => {
      const ref = generateJobReference();
      expect(ref).toMatch(/^REQ-\d{5}$/);
    });
  });

  describe('isValidSpecificDate', () => {
    it('validates future dates and rejects past dates', () => {
      expect(isValidSpecificDate('2099-01-01')).toBe(true);
      expect(isValidSpecificDate('2020-01-01')).toBe(false);
      expect(isValidSpecificDate('not-a-date')).toBe(false);
      expect(isValidSpecificDate('')).toBe(false);
    });
  });

  describe('resolveJobPostingContext', () => {
    it('resolves defaults when empty query is provided', () => {
      const context = resolveJobPostingContext(new URLSearchParams());
      expect(context.jobType).toBe('specific_service');
      expect(context.category).toBeUndefined();
      expect(context.city).toBeUndefined();
      expect(context.isCityActive).toBe(true);
      expect(context.worker).toBeUndefined();
      expect(context.mockError).toBe(false);
    });

    it('resolves known category slug and active city safely', () => {
      const params = new URLSearchParams({
        category: 'generator',
        city: 'Lagos',
        jobType: 'specific_service',
      });
      const context = resolveJobPostingContext(params);
      expect(context.category?.id).toBe('generator');
      expect(context.categoryId).toBe('generator');
      expect(context.city).toBe('Lagos');
      expect(context.isCityActive).toBe(true);
    });

    it('recognizes "not_sure" category parameter', () => {
      const params = new URLSearchParams({
        category: 'not_sure',
        city: 'Abuja',
      });
      const context = resolveJobPostingContext(params);
      expect(context.categoryId).toBe('not_sure');
      expect(context.category).toBeUndefined();
      expect(context.city).toBe('Abuja (FCT)');
      expect(context.isCityActive).toBe(true);
    });

    it('handles inactive or unknown city gracefully', () => {
      const params = new URLSearchParams({
        city: 'Calabar',
      });
      const context = resolveJobPostingContext(params);
      expect(context.city).toBe('Calabar');
      expect(context.isCityActive).toBe(false);
    });

    it('resolves preferred brainworker safely without guaranteed assignment', () => {
      const params = new URLSearchParams({
        worker: 'bw-1',
      });
      const context = resolveJobPostingContext(params);
      expect(context.worker?.id).toBe('bw-1');
      expect(context.worker?.name).toBe('Engr. Emeka Nwosu');
      expect(context.workerId).toBe('bw-1');
    });

    it('resolves broader_project job type', () => {
      const params = new URLSearchParams({
        jobType: 'broader_project',
      });
      const context = resolveJobPostingContext(params);
      expect(context.jobType).toBe('broader_project');
    });

    it('detects mockError parameter', () => {
      const params = new URLSearchParams({
        mockError: '1',
      });
      const context = resolveJobPostingContext(params);
      expect(context.mockError).toBe(true);
    });
  });

  describe('buildPostJobReturnUrl', () => {
    it('constructs /post-job URL with query params', () => {
      const url = buildPostJobReturnUrl({
        category: 'plumbing',
        city: 'Lagos',
        jobContinuation: true,
      });
      expect(url).toContain('/post-job?');
      expect(url).toContain('category=plumbing');
      expect(url).toContain('city=Lagos');
      expect(url).toContain('jobContinuation=1');
    });

    it('returns /post-job when no params given', () => {
      expect(buildPostJobReturnUrl({})).toBe('/post-job');
    });
  });
});
