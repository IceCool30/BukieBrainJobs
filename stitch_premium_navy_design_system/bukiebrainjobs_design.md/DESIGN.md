---
name: Elite Professional Ledger
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#44474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#75777f'
  outline-variant: '#c5c6cf'
  surface-tint: '#4a5e88'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#001a41'
  on-primary-container: '#6f84b0'
  inverse-primary: '#b2c6f7'
  secondary: '#296a4b'
  on-secondary: '#ffffff'
  secondary-container: '#abeec8'
  on-secondary-container: '#2e6e4f'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#360f00'
  on-tertiary-container: '#b47458'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#b2c6f7'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#32466f'
  secondary-fixed: '#aef1ca'
  secondary-fixed-dim: '#93d5af'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#075135'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#6c3921'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  unit-xs: 4px
  unit-sm: 8px
  unit-md: 16px
  unit-lg: 32px
  unit-xl: 64px
---

## Brand & Style

The design system is anchored in a **Corporate Modern** aesthetic with a lean toward **Premium Minimalism**, now optimized for a high-performance **Light Mode** environment. It is designed for high-level recruitment and professional networking, evoking feelings of exclusivity, reliability, and precision.

The visual narrative focuses on "The Executive Space"—utilizing clean tonal layering, high-contrast typography, and a "less but better" philosophy. The interface feels intentional and curated, providing a bright, airy, and professional atmosphere where content and career opportunities are presented against a sophisticated, crisp background.

Key stylistic markers include:
- **Clean Professional Surfaces:** Soft transitions between bright white backgrounds and structured containers.
- **Micro-Interactions:** Subtle, fluid transitions that reinforce a sense of high-end craftsmanship.
- **Sophisticated Utility:** Functional elements are presented with clinical clarity, using the primary navy for structural weight and emerald green for strategic emphasis.

## Colors

The palette is adapted for a premium light mode experience. The brand is anchored in **Deep Navy (#001A41)**, which provides the primary visual weight against a clean, bright backdrop.

- **Primary (Deep Navy):** Acts as the "anchor" color for headers, primary action buttons, and critical brand moments. It represents authority and stability.
- **Secondary (Deep Emerald):** A rich green (#004D31) used for strategic emphasis and specialized professional actions.
- **Neutral Palette:** A range of Slate Grays (derived from #64748B) provides hierarchy for secondary text and subtle borders.
- **Semantic Colors:** Success (Emerald), Warning (Amber), and Error (Crimson) follow standard conventions, optimized for legibility and contrast on light surfaces.

## Typography

This design system uses a dual-font strategy. **Hanken Grotesk** is used for headlines to provide a sharp, modern edge, while **Inter** is used for body copy and labels to ensure maximum legibility and a systematic feel.

- **Tracking:** Generous tracking (0.01em to 0.05em) is applied to body text and labels to enhance the "premium" feel and prevent the UI from feeling cramped.
- **Hierarchy:** Use weight and color value (darkness) to establish hierarchy. Display titles should utilize the primary deep navy or near-black for maximum impact.
- **Accessibility:** Line heights are kept generous (minimum 1.5x for body) to support long-form reading in job descriptions.

## Layout & Spacing

The layout utilizes a **Fixed Grid** model for desktop to maintain a controlled, editorial appearance, while transitioning to a **Fluid Grid** for mobile.

- **Desktop (1440px+):** 12-column grid, 1280px max-width, 24px gutters. Content is centered with wide 64px margins to emphasize the premium whitespace.
- **Tablet (768px - 1024px):** 8-column grid, 32px margins.
- **Mobile (<768px):** 4-column grid, 20px margins.

Spacing follows an 8px base unit. For premium layouts, use "Extreme Padding" (unit-xl) between major sections to force focus on specific content blocks. Avoid thin gutters; prefer wider negative space to separate distinct functional areas.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Soft Ambient Shadows**. In this light theme, depth is represented by subtle shifts in surface color and very soft shadows that suggest a physical stack of materials.

- **Surface Levels:** 
  - Level 0 (Base): Pure white or surface-container-lowest background.
  - Level 1 (Cards/Inputs): Surface-container-low, utilizing subtle shadows or very thin light outlines to define boundaries.
  - Level 2 (Hover/Floating): Surface-container-high with an increased shadow spread or a 1px primary-tinted border to indicate lift.
- **Outlines:** Use low-contrast 1px strokes for most containers to define boundaries without adding visual noise.
- **Overlays:** Modals use a semi-transparent light backdrop with an 8px blur to maintain brand immersion.

## Shapes

The shape language is **Organic and Friendly**, utilizing a high roundedness level to balance the corporate typography. A 1rem (16px) base radius is applied to standard components like inputs and buttons to create an approachable yet sophisticated executive brand voice.

- **Standard (1rem):** Checkboxes, small buttons, input fields.
- **Large (2rem):** Cards, modals, feature containers.
- **Pill-shaped:** Used for status "Chips", "Tags", and primary actions to provide a distinct, modern look.

The high roundedness level (Pill-shaped) reinforces a modern, fluid aesthetic that balances the rigid professional typography.

## Components

### Buttons
- **Primary:** High-contrast white text on a Primary Navy background. Pill-shaped. No border. On hover, darken slightly or add a subtle glow.
- **Secondary:** Transparent background, subtle primary-tinted 1px border and text. Pill-shaped.
- **Accent:** Emerald Green background, high-contrast white text. Use only for "Apply Now" or high-priority conversions.

### Input Fields
- Use a 1px light border. On focus, the border changes to the primary navy with a subtle 2px outer glow. Labels are always `label-md` and placed above the field. Corners follow the 1rem roundedness.

### Cards
- White or surface-container-low background with a 1px border. 2rem corner radius. Use soft shadows to indicate depth; use subtle Tonal Layering or increased shadow on hover.

### Chips & Tags
- Used for job categories or skills. Subtle neutral background with `label-sm` text. Pill-shaped (fully rounded).

### Lists
- Use generous vertical padding (unit-md) between list items. Separate items with a subtle 1px horizontal rule using the `outline-variant` color.

### Checkboxes & Radios
- Highly rounded corners for checkboxes; circular for radios. When active, use Primary Navy or Emerald Green fill to denote a selection state against the light interface.