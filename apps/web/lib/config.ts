// apps/web/lib/config.ts
// Phase 1 App Configuration (AGENTS.md Phase 1 Mock Boundary)

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  IS_PHASE_1_MOCK: true,
} as const;

export type Config = typeof config;