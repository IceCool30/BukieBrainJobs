// Design System Tokens (Elite Professional Ledger - DESIGN.md)
export const Colors = {
  surface: '#F8F9FF',
  surfaceDim: '#CBDBF5',
  surfaceBright: '#F8F9FF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#EFF4FF',
  surfaceContainer: '#E5EEFF',
  surfaceContainerHigh: '#DCE9FF',
  surfaceContainerHighest: '#D3E4FE',
  onSurface: '#0B1C30',
  onSurfaceVariant: '#44474E',
  inverseSurface: '#213145',
  inverseOnSurface: '#EAF1FF',
  outline: '#75777F',
  outlineVariant: '#C5C6CF',
  surfaceTint: '#4A5E88',
  primary: '#001A41',             // Deep Navy (Brand Authority)
  onPrimary: '#FFFFFF',
  primaryContainer: '#001A41',
  onPrimaryContainer: '#6F84B0',
  secondary: '#296A4B',           // Emerald Green (Signal Color, Verification)
  onSecondary: '#FFFFFF',
  secondaryContainer: '#ABEEC8',
  onSecondaryContainer: '#2E6E4F',
  accent: '#F59E0B',              // Amber Gold (Ratings & BukieStar)
  error: '#BA1A1A',
  onError: '#FFFFFF',
  background: '#F8F9FF',
  onBackground: '#0B1C30',
} as const;

export const Typography = {
  fontDisplay: 'Hanken Grotesk, sans-serif',
  fontBody: 'Inter, sans-serif',
} as const;

export const Radius = {
  sm: '0.5rem',     // 8px
  default: '1rem',   // 16px (Buttons, Inputs)
  md: '1.5rem',     // 24px
  lg: '2rem',       // 32px (Cards, Modals)
  full: '9999px',   // Pill Buttons & Tags
} as const;

// Brand Design Tokens (shared-design-package.md)
export const BrandColors = {
  navy: '#001A41',
  navyHover: '#000F2D',
  emerald: '#296A4B',
  emeraldHover: '#205139',
  crimson: '#BA1A1A',
  amber: '#D97706',
  background: '#F8F9FF',
  slate: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
  },
} as const;

export const Shadows = {
  ambientHover: '0 4px 20px rgba(0, 26, 65, 0.15)',
} as const;
