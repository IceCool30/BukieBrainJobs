import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  MOCK_MARKETPLACE_CONTINUATION,
  MOCK_UPCOMING_WORK,
} from './dashboard';
import { SERVICE_CATEGORIES } from './mock/homepage-data';

describe('Route Integrity & Navigation Verification', () => {
  const appDir = path.resolve(__dirname, '../app');

  it('verifies that all service categories in MOCK_MARKETPLACE_CONTINUATION are canonical', () => {
    const validCategorySlugs = new Set(SERVICE_CATEGORIES.map((cat) => cat.id));

    MOCK_MARKETPLACE_CONTINUATION.forEach((item) => {
      expect(
        validCategorySlugs.has(item.categorySlug),
        `Invalid category slug "${item.categorySlug}" in MOCK_MARKETPLACE_CONTINUATION`,
      ).toBe(true);

      expect(item.href).toBe(`/services/${item.categorySlug}`);
    });
  });

  it('verifies that MOCK_UPCOMING_WORK actionUrls are valid application routes', () => {
    MOCK_UPCOMING_WORK.forEach((item) => {
      expect(item.actionUrl).toMatch(/^\/(jobs\?id=|messages\/|receipt\/)/);
    });
  });

  it('verifies that /privacy and /terms pages exist on disk', () => {
    const privacyPagePath = path.join(appDir, 'privacy/page.tsx');
    const termsPagePath = path.join(appDir, 'terms/page.tsx');

    expect(fs.existsSync(privacyPagePath), 'apps/web/app/privacy/page.tsx must exist').toBe(true);
    expect(fs.existsSync(termsPagePath), 'apps/web/app/terms/page.tsx must exist').toBe(true);
  });

  it('verifies all static top-level route files exist in apps/web/app', () => {
    const expectedRoutes = [
      'page.tsx',
      'book/page.tsx',
      'dashboard/page.tsx',
      'enterprise/page.tsx',
      'guarantee/page.tsx',
      'jobs/page.tsx',
      'login/page.tsx',
      'messages/page.tsx',
      'messages/[jobId]/page.tsx',
      'notifications/page.tsx',
      'offline/page.tsx',
      'post-job/page.tsx',
      'privacy/page.tsx',
      'profile/page.tsx',
      'register/page.tsx',
      'services/page.tsx',
      'services/[serviceId]/page.tsx',
      'terms/page.tsx',
      'verify/page.tsx',
      'brainworker/availability/page.tsx',
      'brainworker/dashboard/page.tsx',
      'brainworker/leads/page.tsx',
      'brainworker/onboarding/page.tsx',
      'brainworker/register/page.tsx',
      'brainworker/services/page.tsx',
      'brainworker/verification-status/page.tsx',
    ];

    expectedRoutes.forEach((routeFile) => {
      const fullPath = path.join(appDir, routeFile);
      expect(fs.existsSync(fullPath), `Route file missing: apps/web/app/${routeFile}`).toBe(true);
    });
  });

  it('verifies that Footer service links point to valid canonical service categories', () => {
    const footerFilePath = path.resolve(__dirname, '../components/Footer.tsx');
    const footerContent = fs.readFileSync(footerFilePath, 'utf-8');
    const validCategorySlugs = new Set(SERVICE_CATEGORIES.map((cat) => cat.id));

    const matches = footerContent.matchAll(/href="\/services\/([^"]+)"/g);
    let count = 0;
    for (const match of matches) {
      count++;
      const categorySlug = match[1];
      expect(categorySlug).toBeDefined();
      expect(
        validCategorySlugs.has(categorySlug!),
        `Footer contains invalid category link "/services/${categorySlug}"`,
      ).toBe(true);
    }
    expect(count).toBeGreaterThanOrEqual(6);
  });

  it('verifies that Navbar links "Become a BrainWorker" to dedicated /brainworker/register route', () => {
    const navbarFilePath = path.resolve(__dirname, '../components/Navbar.tsx');
    const navbarContent = fs.readFileSync(navbarFilePath, 'utf-8');

    expect(navbarContent).toContain('href="/brainworker/register"');
  });

  it('verifies that Footer links "Become a BrainWorker" to dedicated /brainworker/register route', () => {
    const footerFilePath = path.resolve(__dirname, '../components/Footer.tsx');
    const footerContent = fs.readFileSync(footerFilePath, 'utf-8');

    expect(footerContent).toContain('href="/brainworker/register"');
    expect(footerContent).toContain('Become a BrainWorker');
  });

  it('verifies that mobile app defines and links the dedicated /brainworker/register route', () => {
    const mobileRegisterPath = path.resolve(__dirname, '../../../apps/mobile/app/brainworker/register.tsx');
    const mobileIndexPath = path.resolve(__dirname, '../../../apps/mobile/app/index.tsx');

    expect(fs.existsSync(mobileRegisterPath), 'Mobile brainworker/register.tsx must exist').toBe(true);
    const mobileIndexContent = fs.readFileSync(mobileIndexPath, 'utf-8');
    expect(mobileIndexContent).toContain('href="/brainworker/register"');
    expect(mobileIndexContent).toContain('Become a BrainWorker');
  });

  it('verifies BecomeWorkerModal uses dual-theme semantic tokens without hardcoded white background', () => {
    const modalFilePath = path.resolve(__dirname, '../components/modals/BecomeWorkerModal.tsx');
    const modalContent = fs.readFileSync(modalFilePath, 'utf-8');

    expect(modalContent).toContain('bg-[var(--card-bg)]');
    expect(modalContent).toContain('bg-[var(--modal-overlay)]');
    expect(modalContent).not.toContain('bg-white');
    expect(modalContent).not.toContain('border-slate-200');
  });
});
