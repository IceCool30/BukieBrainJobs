// apps/web/vitest.config.ts
// Migrated from environmentMatchGlobs (removed in Vitest v4) to defineWorkspace.
// Two inline projects preserve the original split:
//   unit:node  — pure logic tests (lib/**) run in Node for speed
//   unit:jsdom — component/hook tests run in jsdom for DOM APIs
import { defineWorkspace } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// Shared Next.js module aliases so tests can mock useRouter, Image, Link etc.
// without Next.js attempting server-side module resolution.
const nextAliases = {
  'next/navigation': path.resolve(__dirname, './__mocks__/next/navigation.ts'),
  'next/image': path.resolve(__dirname, './__mocks__/next/image.tsx'),
  'next/link': path.resolve(__dirname, './__mocks__/next/link.tsx'),
};

export default defineWorkspace([
  // ── Node environment (pure logic / lib tests) ─────────────────────────────
  {
    plugins: [react()],
    resolve: { alias: nextAliases },
    test: {
      name: 'unit:node',
      environment: 'node',
      include: ['**/*.{test,spec}.{ts,tsx}'],
      exclude: [
        'app/**/*.{test,spec}.{ts,tsx}',
        'components/**/*.{test,spec}.{ts,tsx}',
        'hooks/**/*.{test,spec}.{ts,tsx}',
        'node_modules/**',
      ],
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
    },
  },
  // ── jsdom environment (component / hook tests) ────────────────────────────
  {
    plugins: [react()],
    resolve: { alias: nextAliases },
    test: {
      name: 'unit:jsdom',
      environment: 'jsdom',
      include: [
        'app/**/*.{test,spec}.{ts,tsx}',
        'components/**/*.{test,spec}.{ts,tsx}',
        'hooks/**/*.{test,spec}.{ts,tsx}',
      ],
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
    },
  },
]);
