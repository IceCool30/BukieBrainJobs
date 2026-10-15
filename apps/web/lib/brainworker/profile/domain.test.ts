// apps/web/lib/brainworker/profile/domain.test.ts
// Phase 1 RED: BrainWorker Profile & Portfolio Domain Contracts (PROF-001 to PROF-010)
// Authoritative Specifications: Item 2.7 in master checklist (BW-005)

import { describe, it, expect } from 'vitest';
import {
  validateProfileSchema,
  validateSpokenLanguages,
  validateAvatarUrl,
  validatePortfolioItem,
  validateBeforeAfterPairing,
  assertReviewCounterResponseEligibility,
  createCounterResponse,
  calculateProfileCompleteness,
  sanitizeFinancialExclusion,
} from './domain';
import type {
  BrainWorkerProfile,
  BrainWorkerProfileInput,
  CustomerReview,
  PortfolioItem,
  PortfolioItemInput,
} from './types';

describe('BrainWorker Profile & Portfolio Domain Contracts (PROF-001 to PROF-010)', () => {
  const validProfileInput: BrainWorkerProfileInput = {
    headline: 'Certified Master Electrician with 12 Years Field Experience',
    bio: 'Specialized in residential rewiring, industrial generators, and solar inverters across Lagos Mainland.',
    yearsOfExperience: 12,
    spokenLanguages: ['English', 'Yoruba', 'Nigerian Pidgin'],
    avatarUrl: 'https://res.cloudinary.com/bukie/image/upload/v1234/avatar.jpg',
  };

  const validPortfolioInput: PortfolioItemInput = {
    title: '5kVA Solar Inverter Installation',
    description: 'Complete hybrid solar system installation including lithium battery bank and surge protection.',
    category: 'Solar & Inverter',
    beforeImageUrl: 'https://res.cloudinary.com/bukie/image/upload/v1234/before.jpg',
    afterImageUrl: 'https://res.cloudinary.com/bukie/image/upload/v1234/after.jpg',
    completedDate: '2026-09-15T10:00:00.000Z',
  };

  const samplePublishedReview: CustomerReview = {
    id: 'rev-001',
    bookingId: 'book-001',
    customerId: 'cust-100',
    brainWorkerId: 'bw-200',
    rating: 5,
    criteriaScores: { punctuality: 5, craftsmanship: 5, communication: 5 },
    reviewBody: 'Excellent electrical work. Diagnosed and fixed our distribution box promptly.',
    status: 'PUBLISHED',
    createdAt: '2026-10-01T12:00:00.000Z',
  };

  // ===========================================================================
  // PROF-001: Profile Schema & Sanitization
  // ===========================================================================
  it('PROF-001: validates and sanitizes headline, bio, experience, and rejects control tags', () => {
    const sanitized = validateProfileSchema(validProfileInput);
    expect(sanitized.headline).toBe(validProfileInput.headline);
    expect(sanitized.bio).toBe(validProfileInput.bio);
    expect(sanitized.yearsOfExperience).toBe(12);

    expect(() =>
      validateProfileSchema({ ...validProfileInput, headline: '' })
    ).toThrow(/headline/i);
    expect(() =>
      validateProfileSchema({ ...validProfileInput, headline: 'A'.repeat(101) })
    ).toThrow(/headline.*100/i);
    expect(() =>
      validateProfileSchema({ ...validProfileInput, bio: '' })
    ).toThrow(/bio/i);
    expect(() =>
      validateProfileSchema({ ...validProfileInput, bio: 'A'.repeat(1001) })
    ).toThrow(/bio.*1000/i);
    expect(() =>
      validateProfileSchema({ ...validProfileInput, yearsOfExperience: -1 })
    ).toThrow(/years of experience/i);
    expect(() =>
      validateProfileSchema({ ...validProfileInput, yearsOfExperience: 51 })
    ).toThrow(/years of experience/i);
    expect(() =>
      validateProfileSchema({ ...validProfileInput, yearsOfExperience: 5.5 })
    ).toThrow(/integer/i);

    const stripped = validateProfileSchema({
      ...validProfileInput,
      headline: '<script>alert("xss")</script>Master Electrician',
      bio: '<img src=x onerror=alert(1)>Specialized in rewiring',
    });
    expect(stripped.headline).not.toContain('<script>');
    expect(stripped.bio).not.toContain('<img');
  });

  // ===========================================================================
  // PROF-002: Nigerian Languages Support
  // ===========================================================================
  it('PROF-002: validates spokenLanguages array and recognized Nigerian languages', () => {
    const langs = validateSpokenLanguages(['English', 'Nigerian Pidgin', 'Yoruba', 'Hausa', 'Igbo']);
    expect(langs).toEqual(['English', 'Nigerian Pidgin', 'Yoruba', 'Hausa', 'Igbo']);

    expect(() => validateSpokenLanguages([])).toThrow(/at least one language/i);
    expect(() => validateSpokenLanguages(['Klingon'])).toThrow(/unrecognized language/i);
    expect(() => validateSpokenLanguages('English')).toThrow(/array/i);
    expect(() => validateSpokenLanguages(['English', 'Yoruba', 'English'])).toThrow(
      /duplicate/i
    );
  });

  // ===========================================================================
  // PROF-003: Avatar & Headshot Validation
  // ===========================================================================
  it('PROF-003: validates image URLs and rejects insecure origins or oversized payloads', () => {
    expect(
      validateAvatarUrl('https://res.cloudinary.com/bukie/image/upload/v1234/avatar.jpg')
    ).toBe('https://res.cloudinary.com/bukie/image/upload/v1234/avatar.jpg');
    expect(validateAvatarUrl('/uploads/avatars/artisan-1.png')).toBe(
      '/uploads/avatars/artisan-1.png'
    );
    expect(validateAvatarUrl(null)).toBeNull();

    expect(() => validateAvatarUrl('http://insecure.com/avatar.jpg')).toThrow(/insecure/i);
    expect(() => validateAvatarUrl('javascript:alert(1)')).toThrow(/invalid url/i);

    const oversizedDataUri = 'data:image/png;base64,' + 'A'.repeat(3 * 1024 * 1024);
    expect(() => validateAvatarUrl(oversizedDataUri)).toThrow(/size/i);
  });

  // ===========================================================================
  // PROF-004: Portfolio Item Structure & Cap
  // ===========================================================================
  it('PROF-004: validates portfolio item schema and enforces maximum 20 items cap', () => {
    const validated = validatePortfolioItem(validPortfolioInput, 0);
    expect(validated.title).toBe(validPortfolioInput.title);
    expect(validated.category).toBe(validPortfolioInput.category);
    expect(validated.afterImageUrl).toBe(validPortfolioInput.afterImageUrl);

    expect(() =>
      validatePortfolioItem({ ...validPortfolioInput, title: 'No' }, 0)
    ).toThrow(/title.*3/i);
    expect(() =>
      validatePortfolioItem({ ...validPortfolioInput, title: 'A'.repeat(81) }, 0)
    ).toThrow(/title.*80/i);
    expect(() =>
      validatePortfolioItem({ ...validPortfolioInput, description: 'A'.repeat(501) }, 0)
    ).toThrow(/description.*500/i);
    expect(() =>
      validatePortfolioItem({ ...validPortfolioInput, afterImageUrl: '' }, 0)
    ).toThrow(/after image.*required/i);

    expect(() => validatePortfolioItem(validPortfolioInput, 20)).toThrow(
      /maximum of 20 portfolio items/i
    );
  });

  // ===========================================================================
  // PROF-005: Portfolio Before/After Image Pairing
  // ===========================================================================
  it('PROF-005: validates distinct before and after URLs or solo after image', () => {
    expect(
      validateBeforeAfterPairing(null, 'https://res.cloudinary.com/bukie/after.jpg')
    ).toBe(true);
    expect(
      validateBeforeAfterPairing(undefined, 'https://res.cloudinary.com/bukie/after.jpg')
    ).toBe(true);
    expect(
      validateBeforeAfterPairing(
        'https://res.cloudinary.com/bukie/before.jpg',
        'https://res.cloudinary.com/bukie/after.jpg'
      )
    ).toBe(true);

    const duplicateUrl = 'https://res.cloudinary.com/bukie/same.jpg';
    expect(() => validateBeforeAfterPairing(duplicateUrl, duplicateUrl)).toThrow(
      /before and after images must be distinct/i
    );
  });

  // ===========================================================================
  // PROF-006: Review Counter-Response Eligibility
  // ===========================================================================
  it('PROF-006: enforces response only for published reviews without existing responses', () => {
    expect(() => assertReviewCounterResponseEligibility(samplePublishedReview)).not.toThrow();

    expect(() =>
      assertReviewCounterResponseEligibility({
        ...samplePublishedReview,
        status: 'PENDING',
      })
    ).toThrow(/only published reviews/i);

    expect(() =>
      assertReviewCounterResponseEligibility({
        ...samplePublishedReview,
        status: 'REJECTED',
      })
    ).toThrow(/only published reviews/i);

    expect(() =>
      assertReviewCounterResponseEligibility({
        ...samplePublishedReview,
        status: 'HIDDEN',
      })
    ).toThrow(/only published reviews/i);

    const alreadyAnsweredReview: CustomerReview = {
      ...samplePublishedReview,
      artisanResponse: {
        reviewId: samplePublishedReview.id,
        brainWorkerId: samplePublishedReview.brainWorkerId,
        responseText: 'Thank you for your feedback.',
        respondedAt: '2026-10-02T10:00:00.000Z',
      },
    };
    expect(() =>
      assertReviewCounterResponseEligibility(alreadyAnsweredReview)
    ).toThrow(/already has an artisan response/i);
  });

  // ===========================================================================
  // PROF-007: Review Counter-Response Content & Length
  // ===========================================================================
  it('PROF-007: enforces 10 to 500 characters and creates response record', () => {
    const responseText = 'Thank you for trusting us with your installation. Glad to serve!';
    const fixedDate = new Date('2026-10-02T14:00:00.000Z');

    const result = createCounterResponse(
      samplePublishedReview,
      samplePublishedReview.brainWorkerId,
      responseText,
      fixedDate
    );

    expect(result.counterResponse.responseText).toBe(responseText);
    expect(result.counterResponse.brainWorkerId).toBe(samplePublishedReview.brainWorkerId);
    expect(result.counterResponse.respondedAt).toBe('2026-10-02T14:00:00.000Z');
    expect(result.review.artisanResponse).toEqual(result.counterResponse);

    expect(() =>
      createCounterResponse(samplePublishedReview, 'bw-200', '   ')
    ).toThrow(/at least 10 characters/i);
    expect(() =>
      createCounterResponse(samplePublishedReview, 'bw-200', 'Thanks!')
    ).toThrow(/at least 10 characters/i);
    expect(() =>
      createCounterResponse(samplePublishedReview, 'bw-200', 'A'.repeat(501))
    ).toThrow(/maximum of 500 characters/i);
  });

  // ===========================================================================
  // PROF-008: Customer Rating Immutability
  // ===========================================================================
  it('PROF-008: strictly preserves customer rating and review body without mutation', () => {
    const responseText = 'Thank you for your review. We appreciate your partnership.';
    const result = createCounterResponse(
      samplePublishedReview,
      samplePublishedReview.brainWorkerId,
      responseText
    );

    expect(result.review.rating).toBe(samplePublishedReview.rating);
    expect(result.review.criteriaScores).toEqual(samplePublishedReview.criteriaScores);
    expect(result.review.reviewBody).toBe(samplePublishedReview.reviewBody);
    expect(result.review.customerId).toBe(samplePublishedReview.customerId);
    expect(result.review.status).toBe(samplePublishedReview.status);
  });

  // ===========================================================================
  // PROF-009: Profile Completeness Calculator
  // ===========================================================================
  it('PROF-009: calculates percentage and missing milestones for profile and portfolio', () => {
    const fullProfile: BrainWorkerProfile = {
      brainWorkerId: 'bw-200',
      headline: 'Licensed Solar and Electrical Engineer',
      bio: 'Over a decade servicing high-capacity industrial plants.',
      yearsOfExperience: 10,
      spokenLanguages: ['English', 'Hausa'],
      avatarUrl: 'https://res.cloudinary.com/bukie/avatar.jpg',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };

    const samplePortfolioItem: PortfolioItem = {
      id: 'port-1',
      brainWorkerId: 'bw-200',
      title: 'Solar Panel Array Mounting',
      description: 'Roof mounted 12-panel system',
      category: 'Solar',
      beforeImageUrl: null,
      afterImageUrl: 'https://res.cloudinary.com/bukie/after.jpg',
      completedDate: '2026-09-01T00:00:00.000Z',
      createdAt: '2026-09-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z',
    };

    const completeResult = calculateProfileCompleteness(fullProfile, [samplePortfolioItem]);
    expect(completeResult.percentage).toBe(100);
    expect(completeResult.isComplete).toBe(true);
    expect(completeResult.missingMilestones).toEqual([]);

    const partialResult = calculateProfileCompleteness(
      { ...fullProfile, avatarUrl: null },
      []
    );
    expect(partialResult.isComplete).toBe(false);
    expect(partialResult.percentage).toBeLessThan(100);
    expect(partialResult.missingMilestones).toContain('headshot');
    expect(partialResult.missingMilestones).toContain('portfolio_min_1');

    const emptyResult = calculateProfileCompleteness(null, []);
    expect(emptyResult.percentage).toBe(0);
    expect(emptyResult.isComplete).toBe(false);
    expect(emptyResult.missingMilestones.length).toBeGreaterThan(0);
  });

  // ===========================================================================
  // PROF-010: Strict Financial Exclusion
  // ===========================================================================
  it('PROF-010: strictly strips and rejects wallet, bank account, and payout figures', () => {
    const contaminatedInput = {
      headline: 'Plumbing Specialist',
      bio: 'Fast pipe repair and boreholes.',
      walletBalance: 500000,
      bankAccountNumber: '0123456789',
      bankName: 'First Bank Nigeria',
      payoutAmount: 25000,
      escrowNgn: 15000,
    };

    const sanitized = sanitizeFinancialExclusion(contaminatedInput);
    expect(sanitized).not.toHaveProperty('walletBalance');
    expect(sanitized).not.toHaveProperty('bankAccountNumber');
    expect(sanitized).not.toHaveProperty('bankName');
    expect(sanitized).not.toHaveProperty('payoutAmount');
    expect(sanitized).not.toHaveProperty('escrowNgn');
  });
});
