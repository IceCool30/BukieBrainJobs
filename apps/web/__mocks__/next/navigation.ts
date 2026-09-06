// __mocks__/next/navigation.ts
// Shared vitest mock for next/navigation.
// Individual tests override these with vi.mocked(...).mockReturnValue(...)
// to supply the specific router and searchParams state they need.
import { vi } from 'vitest';

export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}));

export const useSearchParams = vi.fn(() => new URLSearchParams());

export const usePathname = vi.fn(() => '/services');

export const useParams = vi.fn(() => ({}));
