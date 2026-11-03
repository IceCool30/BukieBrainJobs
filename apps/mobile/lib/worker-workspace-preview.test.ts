import { describe, expect, it } from 'vitest';
import {
  WORKER_WORKSPACE_DISCLAIMER,
  SAMPLE_WORKER_LEADS,
  SAMPLE_LEAD_ALERT,
  getSampleLeadById,
  BW003_DECLINE_REASONS,
  getDeclineReasonLabel,
  type WorkerSampleLead,
  type DeclineReasonCode,
} from './worker-workspace-preview';
import { CANONICAL_SERVICES } from './services';

describe('MOB-WORK-001 native BrainWorker workspace preview helper', () => {
  it('defines the exact truthful local sample disclaimer', () => {
    expect(WORKER_WORKSPACE_DISCLAIMER).toBe(
      'Sample preview only. The leads shown here are local examples. This is not a live BrainWorker account, lead feed or push alert service.',
    );
  });

  it('provides between 3 and 4 immutable sample leads', () => {
    expect(SAMPLE_WORKER_LEADS.length).toBeGreaterThanOrEqual(3);
    expect(SAMPLE_WORKER_LEADS.length).toBeLessThanOrEqual(4);
    expect(Object.isFrozen(SAMPLE_WORKER_LEADS)).toBe(true);
  });

  it('maps each sample lead to an existing canonical service title', () => {
    const validTitles = new Set(CANONICAL_SERVICES.map((s) => s.title));
    for (const lead of SAMPLE_WORKER_LEADS) {
      expect(validTitles.has(lead.serviceTitle)).toBe(true);
      expect(lead.id).toMatch(/^lead_/);
      expect(lead.problemSummary.length).toBeGreaterThan(10);
      expect(lead.problemDetail.length).toBeGreaterThan(20);
    }
  });

  it('enforces strict BW-003 privacy masking across all sample leads', () => {
    const prohibitedNames = ['Babajide', 'Solomon', 'Bukie', 'Emeka', 'Chidi', 'Musa', 'John Doe'];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(?:080|090|070|081|\+234)\d+/;
    const streetRegex = /\b(?:Plot|House|Flat|No\.)\s*\d+/i;

    for (const lead of SAMPLE_WORKER_LEADS) {
      const serialized = JSON.stringify(lead);
      for (const name of prohibitedNames) {
        expect(serialized).not.toContain(name);
      }
      expect(serialized).not.toMatch(emailRegex);
      expect(serialized).not.toMatch(phoneRegex);
      expect(serialized).not.toMatch(streetRegex);
      expect(lead).not.toHaveProperty('customerName');
      expect(lead).not.toHaveProperty('customerPhone');
      expect(lead).not.toHaveProperty('customerEmail');
      expect(lead).not.toHaveProperty('streetAddress');
    }
  });

  it('enforces anti-fabrication rules with explicit sample-only values', () => {
    for (const lead of SAMPLE_WORKER_LEADS) {
      expect(lead.sampleUrgency).toMatch(/sample/i);
      expect(lead.sampleTimeframe).toMatch(/sample/i);
      expect(lead.sampleBudget).toMatch(/₦/);
      expect(lead).not.toHaveProperty('workerRating');
      expect(lead).not.toHaveProperty('completionRate');
      expect(lead).not.toHaveProperty('verificationBadge');
      expect(lead).not.toHaveProperty('countdownSeconds');
    }
  });

  it('defines the sample lead alert matching an existing sample lead', () => {
    expect(SAMPLE_LEAD_ALERT).toBeDefined();
    expect(SAMPLE_LEAD_ALERT.id).toBe(SAMPLE_WORKER_LEADS[0].id);
    expect(SAMPLE_LEAD_ALERT.alertTag).toBe('SAMPLE LEAD ALERT');
    expect(SAMPLE_LEAD_ALERT.sampleUrgency).toMatch(/sample/i);
  });

  it('allows looking up a sample lead by id', () => {
    const first = SAMPLE_WORKER_LEADS[0];
    expect(getSampleLeadById(first.id)).toEqual(first);
    expect(getSampleLeadById('non_existent')).toBeUndefined();
  });

  it('exports exactly 6 canonical BW-003 decline reasons with code and label', () => {
    expect(BW003_DECLINE_REASONS).toBeDefined();
    expect(BW003_DECLINE_REASONS.length).toBe(6);
    const codes = BW003_DECLINE_REASONS.map((r) => r.code);
    expect(codes).toEqual([
      'SCHEDULE_CONFLICT',
      'OUTSIDE_COVERAGE_AREA',
      'SKILL_TOOL_MISMATCH',
      'RATE_BUDGET_MISMATCH',
      'TEMPORARILY_UNAVAILABLE',
      'OTHER',
    ]);
  });

  it('resolves decline reason label by canonical code', () => {
    expect(getDeclineReasonLabel('SCHEDULE_CONFLICT')).toBe('Schedule conflict');
    expect(getDeclineReasonLabel('OUTSIDE_COVERAGE_AREA')).toBe('Outside coverage area');
    expect(getDeclineReasonLabel('SKILL_TOOL_MISMATCH')).toBe('Skill or tool mismatch');
    expect(getDeclineReasonLabel('RATE_BUDGET_MISMATCH')).toBe('Rate or budget mismatch');
    expect(getDeclineReasonLabel('TEMPORARILY_UNAVAILABLE')).toBe('Temporarily unavailable');
    expect(getDeclineReasonLabel('OTHER')).toBe('Other reason');
  });
});
