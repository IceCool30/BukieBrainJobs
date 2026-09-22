// __mocks__/next/navigation.ts
// Shared vitest mock for next/navigation.
// Individual tests override these with vi.mocked(...).mockReturnValue(...)
// to supply the specific router and searchParams state they need.
import { vi } from 'vitest';

import type { ReadonlyURLSearchParams } from 'next/navigation';

// Local router shape — avoids importing AppRouterInstance (not exported by
// all Next.js versions) and prevents TS2742 portability errors from Vitest v4
// inferring an un-nameable @vitest/spy type on the exported symbol.
type RouterMock = {
  push: (href: string, options?: object) => void;
  replace: (href: string, options?: object) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: (href: string, options?: object) => void;
};

// Explicit declared type hides the Mock<RouterMock> internals from tsc.
export const useRouter: () => RouterMock = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}));

export const useSearchParams: () => ReadonlyURLSearchParams = vi.fn(
  () => new URLSearchParams() as unknown as ReadonlyURLSearchParams,
);

export const usePathname: () => string = vi.fn(() => '/services');

export const useParams: () => Record<string, string> = vi.fn(() => ({}));

export const notFound: () => void = vi.fn();
