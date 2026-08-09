import type { Config } from 'tailwindcss'
import { brandColors } from './src/tokens/colors'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../apps/web/**/*.{ts,tsx}',
    '../../apps/mobile/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: brandColors,
      fontFamily: {
        display: ['Hanken Grotesk', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'lg':  '12px',
        'xl':  '16px',   // Controls, inputs, buttons (DESIGN.md)
        '2xl': '24px',
        '3xl': '32px',   // Cards, modal sheets (DESIGN.md)
        'full': '9999px', // Pills, tags, primary CTAs
      },
      spacing: {
        '0.5': '4px',
        '1':   '8px',    // Base rhythm (DESIGN.md)
        '1.5': '12px',
        '2':   '16px',
        '3':   '24px',
        '4':   '32px',
        '5':   '40px',
        '6':   '48px',
        '8':   '64px',
      },
      boxShadow: {
        'ambient': '0 4px 20px rgba(0, 26, 65, 0.08)',
        'ambient-hover': '0 4px 20px rgba(0, 26, 65, 0.15)',
      },
    },
  },
  plugins: [],
}

export default config
export { brandColors }