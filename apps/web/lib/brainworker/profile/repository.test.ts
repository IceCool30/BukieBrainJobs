// apps/web/lib/brainworker/profile/repository.test.ts
// BrainWorker Profile & Portfolio Repository Contracts (REP-001 to REP-010)
// Item 2.7 in master checklist (BW-005)

import { beforeEach, describe, expect, it } from 'vitest';
import {
  BrainWorkerProfileRepository,
  createBrainWorkerProfileRepository,
  resetBrainWorkerProfileRepository,
} from './repository';
import type {
  BrainWorkerProfile,
  NigerianLanguage,
} from './types';

describe('BrainWorker Profile & Portfolio Repository Contracts (REP-001 to REP-010)', () => {
  let repo: BrainWorkerProfileRepository;

  beforeEach(() => {
    resetBrainWorkerProfileRepository();
    repo = createBrainWorkerProfileRepository();
  });

  const samplePortfolioItemInput = {
    title: 'Distribution Box Installation',
    description: 'Complete rewiring and industrial breaker setup.',
    category: 'Electrical',
    beforeImageUrl: 'https://example.com/before.jpg',
    afterImageUrl: 'https://example.com/after.jpg',
    completedDate: '2026-09-10T12:00:00.000Z',
    brainWorkerId: 'worker-a',
    updatedAt: '2026-09-10T12:00:00.000Z',
  };

  it('REP-001: strict tenant isolation: getProfile and getPortfolio return data strictly scoped to worker', async () => {
    await repo.saveProfile('worker-a', {
      headline: 'Master Electrician in Ikeja',
      bio: 'Licensed artisan with 10 years experience.',
      yearsOfExperience: 10,
      spokenLanguages: ['English', 'Yoruba'],
    });

    await repo.saveProfile('worker-b', {
      headline: 'Plumbing Specialist in Surulere',
      bio: 'Emergency leak detection and pipe fitting.',
      yearsOfExperience: 7,
      spokenLanguages: ['English', 'Igbo'],
    });

    await repo.addPortfolioItem('worker-a', {
      ...samplePortfolioItemInput,
      brainWorkerId: 'worker-a',
    });

    const profileA = await repo.getProfile('worker-a');
    const profileB = await repo.getProfile('worker-b');

    expect(profileA?.brainWorkerId).toBe('worker-a');
    expect(profileA?.headline).toBe('Master Electrician in Ikeja');
    expect(profileB?.brainWorkerId).toBe('worker-b');
    expect(profileB?.headline).toBe('Plumbing Specialist in Surulere');

    const portfolioA = await repo.getPortfolio('worker-a');
    const portfolioB = await repo.getPortfolio('worker-b');

    expect(portfolioA.length).toBe(1);
    expect(portfolioA[0]?.brainWorkerId).toBe('worker-a');
    expect(portfolioB.length).toBe(0);
  });

  it('REP-002: returns default seeded profile with safe metadata when worker has no custom profile', async () => {
    const profile = await repo.getProfile('worker-unconfigured');

    expect(profile).not.toBeNull();
    expect(profile?.brainWorkerId).toBe('worker-unconfigured');
    expect(profile?.headline).toBe('');
    expect(profile?.bio).toBe('');
    expect(profile?.yearsOfExperience).toBe(0);
    expect(profile?.spokenLanguages).toEqual(['English']);
    expect(profile?.avatarUrl).toBeNull();
  });

  it('REP-003: saveProfile sanitizes inputs and persists changes with updated timestamp', async () => {
    const updated = await repo.saveProfile('worker-sanitize', {
      headline: '<script>alert("hack")</script>Senior Carpenter',
      bio: 'Cabinet making <b>and wood carving</b>.',
      yearsOfExperience: 8,
      spokenLanguages: ['English', 'Pidgin' as unknown as NigerianLanguage],
      avatarUrl: 'https://example.com/avatar.jpg',
    });

    expect(updated.headline).toBe('Senior Carpenter');
    expect(updated.bio).toBe('Cabinet making and wood carving.');
    expect(updated.yearsOfExperience).toBe(8);
    expect(updated.spokenLanguages).toEqual(['English', 'Nigerian Pidgin']);
    expect(updated.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(updated.updatedAt).toBeDefined();

    const fetched = await repo.getProfile('worker-sanitize');
    expect(fetched?.headline).toBe('Senior Carpenter');
  });

  it('REP-004: getPortfolio returns items sorted chronologically by completedDate descending', async () => {
    await repo.addPortfolioItem('worker-sort', {
      ...samplePortfolioItemInput,
      title: 'July Project',
      completedDate: '2026-07-01T10:00:00.000Z',
      brainWorkerId: 'worker-sort',
    });

    await repo.addPortfolioItem('worker-sort', {
      ...samplePortfolioItemInput,
      title: 'October Project',
      completedDate: '2026-10-01T10:00:00.000Z',
      brainWorkerId: 'worker-sort',
    });

    await repo.addPortfolioItem('worker-sort', {
      ...samplePortfolioItemInput,
      title: 'August Project',
      completedDate: '2026-08-15T10:00:00.000Z',
      brainWorkerId: 'worker-sort',
    });

    const items = await repo.getPortfolio('worker-sort');
    const titles = items.map((item) => item.title);
    expect(titles).toEqual(['October Project', 'August Project', 'July Project']);
  });

  it('REP-005: addPortfolioItem assigns unique UUID, associates worker ID, and persists images', async () => {
    const item = await repo.addPortfolioItem('worker-create', {
      title: 'Modern Kitchen Cabinetry',
      description: 'Solid mahogany kitchen units with granite top fitting.',
      category: 'Carpentry',
      beforeImageUrl: 'https://example.com/old-kitchen.jpg',
      afterImageUrl: 'https://example.com/new-kitchen.jpg',
      completedDate: '2026-09-20T10:00:00.000Z',
      brainWorkerId: 'worker-create',
      updatedAt: '2026-09-20T10:00:00.000Z',
    });

    expect(item.id).toBeDefined();
    expect(typeof item.id).toBe('string');
    expect(item.id.length).toBeGreaterThan(0);
    expect(item.brainWorkerId).toBe('worker-create');
    expect(item.beforeImageUrl).toBe('https://example.com/old-kitchen.jpg');
    expect(item.afterImageUrl).toBe('https://example.com/new-kitchen.jpg');
    expect(item.createdAt).toBeDefined();
    expect(item.updatedAt).toBeDefined();
  });

  it('REP-006: enforces hard cap of maximum 20 portfolio items per artisan', async () => {
    for (let i = 1; i <= 20; i++) {
      await repo.addPortfolioItem('worker-capped', {
        ...samplePortfolioItemInput,
        title: `Portfolio Item ${i}`,
        completedDate: `2026-01-${String(i).padStart(2, '0')}T10:00:00.000Z`,
        brainWorkerId: 'worker-capped',
      });
    }

    const currentItems = await repo.getPortfolio('worker-capped');
    expect(currentItems.length).toBe(20);

    await expect(
      repo.addPortfolioItem('worker-capped', {
        ...samplePortfolioItemInput,
        title: 'Exceeding 21st Item',
        completedDate: '2026-02-01T10:00:00.000Z',
        brainWorkerId: 'worker-capped',
      })
    ).rejects.toThrow(/maximum of 20 portfolio items/i);
  });

  it('REP-007: tenant-protected portfolio deletion rejects cross-tenant attempts and deletes owned item', async () => {
    const item = await repo.addPortfolioItem('worker-owner', {
      ...samplePortfolioItemInput,
      brainWorkerId: 'worker-owner',
    });

    await expect(
      repo.deletePortfolioItem('worker-intruder', item.id)
    ).rejects.toThrow(/not authorized|forbidden|not found/i);

    const deleted = await repo.deletePortfolioItem('worker-owner', item.id);
    expect(deleted).toBe(true);

    const itemsRemaining = await repo.getPortfolio('worker-owner');
    expect(itemsRemaining.find((i) => i.id === item.id)).toBeUndefined();
  });

  it('REP-008: getReviews retrieves reviews assigned to worker with reviewer details and scores', async () => {
    const reviews = await repo.getReviews('worker-reviewed');

    expect(Array.isArray(reviews)).toBe(true);
    expect(reviews.length).toBeGreaterThan(0);
    const firstReview = reviews[0]!;
    expect(firstReview.brainWorkerId).toBe('worker-reviewed');
    expect(firstReview.rating).toBeGreaterThanOrEqual(1);
    expect(firstReview.rating).toBeLessThanOrEqual(5);
    expect(firstReview.reviewBody).toBeDefined();
    expect(firstReview.customerName).toBeDefined();
  });

  it('REP-009: submitReviewCounterResponse persists response with timestamp without mutating rating', async () => {
    const reviews = await repo.getReviews('worker-responding');
    const targetReview = reviews[0]!;
    const originalRating = targetReview.rating;
    const originalBody = targetReview.reviewBody;

    const updated = await repo.submitReviewCounterResponse(
      'worker-responding',
      targetReview.id,
      'Thank you for your valuable feedback. We take pride in quality delivery.'
    );

    expect(updated.artisanResponse).toBeDefined();
    expect(updated.artisanResponse?.brainWorkerId).toBe('worker-responding');
    expect(updated.artisanResponse?.responseText).toContain('Thank you for your valuable feedback');
    expect(updated.artisanResponse?.respondedAt).toBeDefined();
    expect(updated.rating).toBe(originalRating);
    expect(updated.reviewBody).toBe(originalBody);
  });

  it('REP-010: strictly decouples and drops financial keys from storage and return values', async () => {
    const profileWithFinancials = {
      headline: 'Master Generator Technician',
      bio: 'Diesel generator maintenance and load balancing.',
      yearsOfExperience: 6,
      spokenLanguages: ['English' as const],
      walletBalance: 25000000,
      bankAccount: '0012345678',
      escrowNgn: 450000,
      payoutAmount: 120000,
    };

    const saved = await repo.saveProfile(
      'worker-financial',
      profileWithFinancials as unknown as Partial<BrainWorkerProfile>
    );

    expect((saved as unknown as Record<string, unknown>).walletBalance).toBeUndefined();
    expect((saved as unknown as Record<string, unknown>).bankAccount).toBeUndefined();
    expect((saved as unknown as Record<string, unknown>).escrowNgn).toBeUndefined();
    expect((saved as unknown as Record<string, unknown>).payoutAmount).toBeUndefined();

    const fetched = await repo.getProfile('worker-financial');
    expect((fetched as unknown as Record<string, unknown> | null)?.walletBalance).toBeUndefined();
    expect((fetched as unknown as Record<string, unknown> | null)?.bankAccount).toBeUndefined();
    expect((fetched as unknown as Record<string, unknown> | null)?.escrowNgn).toBeUndefined();
  });
});
