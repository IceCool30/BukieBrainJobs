import { describe, expect, it } from 'vitest';
import {
  PUBLIC_BRAINWORKER_IDS,
  buildPublicBrainWorkerBookingUrl,
  buildPublicBrainWorkerServicesUrl,
  getPublicBrainWorker,
  getServiceCategory,
  resolvePublicBrainWorkerContext,
} from './homepage-data';

describe('getServiceCategory', () => {
  it('returns the selected public service category by its route identifier', () => {
    expect(getServiceCategory('generator')).toMatchObject({
      id: 'generator',
      startingPrice: '₦10,000',
      title: 'Generator Servicing & Repair',
    });
  });

  it('returns undefined for an unknown route identifier', () => {
    expect(getServiceCategory('unlisted-service')).toBeUndefined();
  });
});

describe('resolvePublicBrainWorkerContext', () => {
  it('accepts a valid canonical service identifier', () => {
    expect(resolvePublicBrainWorkerContext({ serviceId: 'generator' }).service?.id).toBe('generator');
  });

  it('rejects an unknown service identifier', () => {
    expect(resolvePublicBrainWorkerContext({ serviceId: 'unknown' }).service).toBeUndefined();
  });

  it('rejects an arbitrary incoming service display string', () => {
    const context = resolvePublicBrainWorkerContext({ service: 'Unsafe service', city: 'Lagos' });
    expect(context.service).toBeUndefined();
    expect(context.city).toBe('Lagos');
  });

  it('accepts an active city by its canonical display value', () => {
    expect(resolvePublicBrainWorkerContext({ city: 'Lagos' }).city).toBe('Lagos');
  });

  it('rejects an inactive or unknown city', () => {
    expect(resolvePublicBrainWorkerContext({ city: 'London' }).city).toBeUndefined();
  });

  it('treats a missing service identifier as absent', () => {
    expect(resolvePublicBrainWorkerContext({ city: 'Lagos' }).service).toBeUndefined();
  });

  it('treats a missing city as absent', () => {
    expect(resolvePublicBrainWorkerContext({ serviceId: 'generator' }).city).toBeUndefined();
  });
});

describe('public BrainWorker inventory and URLs', () => {
  it('contains exactly the four approved public BrainWorker records', () => {
    expect(PUBLIC_BRAINWORKER_IDS).toEqual(['bw-1', 'bw-2', 'bw-3', 'bw-4']);
  });

  it('projects only public-safe profile fields', () => {
    const profile = getPublicBrainWorker('bw-1');
    expect(profile).toBeDefined();
    expect(Object.keys(profile ?? {}).sort()).toEqual([
      'avatarUrl',
      'category',
      'id',
      'location',
      'name',
      'skills',
      'startingRate',
      'title',
    ]);
    expect(profile).not.toHaveProperty('rating');
    expect(profile).not.toHaveProperty('reviewCount');
    expect(profile).not.toHaveProperty('completedJobs');
    expect(profile).not.toHaveProperty('passportTier');
  });

  it('returns no profile for an unknown public BrainWorker ID', () => {
    expect(getPublicBrainWorker('bw-unknown')).toBeUndefined();
  });

  it('builds the canonical Services return URL', () => {
    const context = resolvePublicBrainWorkerContext({ serviceId: 'generator', city: 'Lagos' });
    expect(buildPublicBrainWorkerServicesUrl(context)).toBe(
      '/services?category=generator&q=Generator+Servicing+%26+Repair&city=Lagos',
    );
  });

  it('builds the canonical booking handoff from public profile data', () => {
    const profile = getPublicBrainWorker('bw-1');
    const context = resolvePublicBrainWorkerContext({ serviceId: 'generator', city: 'Lagos' });
    expect(profile && buildPublicBrainWorkerBookingUrl(profile, context)).toBe(
      '/book?service=Generator+Servicing+%26+Repair&price=%E2%82%A612%2C000&city=Lagos&worker=Engr.+Emeka+Nwosu',
    );
  });

  it('does not allow arbitrary service values into the booking URL', () => {
    const profile = getPublicBrainWorker('bw-1');
    const context = resolvePublicBrainWorkerContext({ service: 'Unsafe service', city: 'Lagos' });
    expect(profile && buildPublicBrainWorkerBookingUrl(profile, context)).toBeUndefined();
  });
});
