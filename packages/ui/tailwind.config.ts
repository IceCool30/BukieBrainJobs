import type { Config } from 'tailwindcss';

/** @type {Config} */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../apps/web/**/*.{ts,tsx}',
    '../../apps/mobile/**/*.{ts,tsx}',
  ],
};

export default config;
export { config as brandColors };