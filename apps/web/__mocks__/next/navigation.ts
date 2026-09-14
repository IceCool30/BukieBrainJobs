// __mocks__/next/navigation.ts
// Shared vitest mock for next/navigation.
// Individual tests override these with vi.mocked(...).mockReturnValue(...)
// to supply the specific router and searchParams state they need.
import { vi } from 'vitest';

import type { AppRouterInstance, ReadonlyURLSearchParams } from 'next/navigation';

// Explicit return type annotation prevents TS2742 ("cannot be named without a
// reference to @vitest/spy") introduced by the Vitest v4 type changes.
export const useRouter = vi.fn((): Partial<AppRouterInstance> => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}));

export const useSearchParams = vi.fn(
  () => new URLSearchParams() as unknown as ReadonlyURLSearchParams,
);

export const usePathname = vi.fn(() => '/services');

export const useParams = vi.fn(() => ({}));
