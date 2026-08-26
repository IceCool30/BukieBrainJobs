import { describe, expect, it } from 'vitest';
import { getServiceCategory } from './homepage-data';

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
