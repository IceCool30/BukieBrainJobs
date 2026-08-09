// packages/ui/src/tokens/colors.ts
// Brand design tokens - single source of truth for all apps
// Must match DESIGN.md: Deep Navy primary, Emerald secondary, Amber accent
import colors from 'tailwindcss/colors';

export const brandColors = {
  navy: {
    DEFAULT: '#001A41',
    50:  '#F0F4FA',
    100: '#D6E0F0',
    200: '#ADBFE0',
    300: '#7A98C8',
    400: '#4A6EA8',
    500: '#003478',
    600: '#002A62',
    700: '#001F4D',
    800: '#001A41',
    900: '#000F2D',
  },
  emerald: {
    DEFAULT: '#296A4B',
    50:  '#EEFBF3',
    100: '#D4F5E2',
    200: '#ABEEC8',
    300: '#72DFA3',
    400: '#40C87A',
    500: '#2E8B57',
    600: '#296A4B',
    700: '#205139',
    800: '#1A3F2D',
    900: '#132E21',
  },
  amber: {
    DEFAULT: '#F59E0B',
    50:  '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
  },
  // Use Tailwind's native slate as required by DESIGN.md (derived from #64748B)
  slate: colors.slate,
  
  // Material Design 3 (M3) Semantic Tokens from DESIGN.md frontmatter
  surface: {
    DEFAULT: '#f8f9ff',
    dim: '#cbdbf5',
    bright: '#f8f9ff',
    'container-lowest': '#ffffff',
    'container-low': '#eff4ff',
    container: '#e5eeff',
    'container-high': '#dce9ff',
    'container-highest': '#d3e4fe',
    tint: '#4a5e88',
  },
  'on-surface': {
    DEFAULT: '#0b1c30',
    variant: '#44474e',
  },
  'inverse-surface': '#213145',
  'inverse-on-surface': '#eaf1ff',
  outline: {
    DEFAULT: '#75777f',
    variant: '#c5c6cf',
  },
  primary: {
    DEFAULT: '#000000',
    container: '#001a41',
    fixed: '#d8e2ff',
    'fixed-dim': '#b2c6f7',
  },
  'on-primary': {
    DEFAULT: '#ffffff',
    container: '#6f84b0',
    fixed: '#001a41',
    'fixed-variant': '#32466f',
  },
  'inverse-primary': '#b2c6f7',
  secondary: {
    DEFAULT: '#296a4b',
    container: '#abeec8',
    fixed: '#aef1ca',
    'fixed-dim': '#93d5af',
  },
  'on-secondary': {
    DEFAULT: '#ffffff',
    container: '#2e6e4f',
    fixed: '#002112',
    'fixed-variant': '#075135',
  },
  tertiary: {
    DEFAULT: '#000000',
    container: '#360f00',
    fixed: '#ffdbcd',
    'fixed-dim': '#ffb596',
  },
  'on-tertiary': {
    DEFAULT: '#ffffff',
    container: '#b47458',
    fixed: '#360f00',
    'fixed-variant': '#6c3921',
  },
  error: {
    DEFAULT: '#ba1a1a',
    container: '#ffdad6',
  },
  'on-error': {
    DEFAULT: '#ffffff',
    container: '#93000a',
  },
  background: '#f8f9ff',
  'on-background': '#0b1c30',
  'surface-variant': '#d3e4fe',
};

export type BrandColors = typeof brandColors;