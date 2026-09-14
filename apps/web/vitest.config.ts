// apps/web/vitest.config.ts
// Vitest v4 compatible config. environmentMatchGlobs was removed in v4;
// jsdom is set globally — appropriate for a React/Next.js app where even
// lib tests occasionally rely on browser-like globals (TextEncoder, etc.).
// For pure-Node speed-sensitive suites, add `// @vitest-environment node`
// at the top of the individual test file.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias next/navigation so component tests can mock useRouter / useSearchParams
      // without Next.js attempting server-side module resolution.
      'next/navigation': path.resolve(__dirname, './__mocks__/next/navigation.ts'),
      'next/image': path.resolve(__dirname, './__mocks__/next/image.tsx'),
      'next/link': path.resolve(__dirname, './__mocks__/next/link.tsx'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
