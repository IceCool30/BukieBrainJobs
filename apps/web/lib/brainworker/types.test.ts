// apps/web/lib/brainworker/types.test.ts
// Phase 1 RED: Domain Types, Enums & Invariants
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 1: TYP-001)

import { describe, it, expect } from 'vitest';
import type {
  BrainWorkerOnboardingStatus,
  OnboardingStep,
  GovernmentIdType,
  TradeCredentialType,
  WorkProofType,
  SpecificDocumentType,
  RejectionReasonCode,
} from './types';
import {
  UnauthorizedError,
  NotFoundError,
  StateConflictError,
  ValidationError,
} from './types';

describe('BW-001 Domain Models, Types & Invariants (Suite 1)', () => {
  it('TYP-001: validates BrainWorkerOnboardingStatus enum values and lifecycle states', () => {
    const validStatuses: BrainWorkerOnboardingStatus[] = [
      'DRAFT',
      'SUBMITTED',
      'PENDING_REVIEW',
      'REMEDIATION_REQUIRED',
      'REJECTED',
      'APPROVED',
    ];
    expect(validStatuses).toHaveLength(6);
    expect(validStatuses).toContain('DRAFT');
    expect(validStatuses).toContain('SUBMITTED');
    expect(validStatuses).toContain('PENDING_REVIEW');
    expect(validStatuses).toContain('REMEDIATION_REQUIRED');
    expect(validStatuses).toContain('REJECTED');
    expect(validStatuses).toContain('APPROVED');
  });

  it('TYP-002: validates OnboardingStep funnel progression stages', () => {
    const validSteps: OnboardingStep[] = ['identity', 'trade', 'credentials', 'review'];
    expect(validSteps).toHaveLength(4);
    expect(validSteps[0]).toBe('identity');
    expect(validSteps[1]).toBe('trade');
    expect(validSteps[2]).toBe('credentials');
    expect(validSteps[3]).toBe('review');
  });

  it('TYP-003: validates SpecificDocumentType encompasses Government ID, Trade Proof, and Work Proof', () => {
    const govDocs: GovernmentIdType[] = [
      'NIN_SLIP',
      'NATIONAL_EID',
      'DRIVERS_LICENSE',
      'VOTERS_CARD',
      'INTERNATIONAL_PASSPORT',
    ];
    const tradeDocs: TradeCredentialType[] = [
      'TRADE_TEST_CERTIFICATE',
      'APPRENTICESHIP_LETTER',
      'VOCATIONAL_DIPLOMA',
      'ASSOCIATION_ID',
    ];
    const workDocs: WorkProofType[] = [
      'WORKSHOP_PHOTO',
      'TOOL_EQUIPMENT_PHOTO',
      'PAST_WORK_PHOTO',
    ];

    expect(govDocs).toHaveLength(5);
    expect(tradeDocs).toHaveLength(4);
    expect(workDocs).toHaveLength(3);

    // Validate SpecificDocumentType satisfies all
    const sampleGov: SpecificDocumentType = 'NIN_SLIP';
    const sampleTrade: SpecificDocumentType = 'APPRENTICESHIP_LETTER';
    const sampleWork: SpecificDocumentType = 'WORKSHOP_PHOTO';
    expect([sampleGov, sampleTrade, sampleWork]).toBeDefined();
  });

  it('TYP-004: validates RejectionReasonCode covers authoritative disqualification reasons', () => {
    const codes: RejectionReasonCode[] = [
      'FRAUD_SUSPECTED',
      'UNVERIFIABLE_CREDENTIALS',
      'INELIGIBLE_APPLICANT',
      'DOCUMENT_FORGERY',
      'OTHER',
    ];
    expect(codes).toHaveLength(5);
    expect(codes).toContain('FRAUD_SUSPECTED');
    expect(codes).toContain('UNVERIFIABLE_CREDENTIALS');
  });

  it('TYP-005: verifies domain custom errors subclass Error with correct names', () => {
    const unauth = new UnauthorizedError('Denied');
    expect(unauth).toBeInstanceOf(Error);
    expect(unauth.name).toBe('UnauthorizedError');
    expect(unauth.message).toBe('Denied');

    const notFound = new NotFoundError('Missing');
    expect(notFound).toBeInstanceOf(Error);
    expect(notFound.name).toBe('NotFoundError');

    const conflict = new StateConflictError('Locked');
    expect(conflict).toBeInstanceOf(Error);
    expect(conflict.name).toBe('StateConflictError');

    const validation = new ValidationError('Bad input');
    expect(validation).toBeInstanceOf(Error);
    expect(validation.name).toBe('ValidationError');
  });
});
