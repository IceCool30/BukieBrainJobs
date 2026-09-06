// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Pure logic tests (lib/**) run in node — fast, no DOM overhead.
    // Component tests (app/**, components/**) run in jsdom.
    environment: 'node',
    environmentMatchGlobs: [
      ['app/**', 'jsdom'],
      ['components/**', 'jsdom'],
    ],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      // Alias next/navigation so component tests can mock useRouter / useSearchParams
      // without Next.js attempting server-side module resolution.
      'next/navigation': path.resolve(__dirname, './__mocks__/next/navigation.ts'),
      'next/image': path.resolve(__dirname, './__mocks__/next/image.tsx'),
      'next/link': path.resolve(__dirname, './__mocks__/next/link.tsx'),
    },
  },
});
