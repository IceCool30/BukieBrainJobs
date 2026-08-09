// Shared Tailwind Theme — single source of truth for all apps
// Import this in your tailwind.config.ts: import { tailwindBrandTheme } from '@bukiebrainjobs/ui';

import { brandColors } from './tokens/colors';

/**
 * Spread this into your Tailwind config's `theme.extend` to get
 * the full BukieBrainJobs brand design system.
 *
 * Usage:
 * ```ts
 * import { tailwindBrandTheme } from '@bukiebrainjobs/ui';
 * export default { theme: { extend: { ...tailwindBrandTheme } } };
 * ```
 */
export const tailwindBrandTheme = {
  colors: brandColors,
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
    headline: ['Hanken Grotesk', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
  },
  borderRadius: {
    button: '9999px',
    input: '1rem',
    card: '2rem',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
  },
  boxShadow: {
    'ambient-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
} satisfies Record<string, unknown>;
