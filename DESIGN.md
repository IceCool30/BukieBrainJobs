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

The design system is anchored in a **Corporate Modern** aesthetic with a lean toward **Premium Minimalism**. It is designed for high-level recruitment and professional networking, evoking feelings of exclusivity, reliability, and precision.

The visual narrative focuses on "The Executive Space"—utilizing generous white space, high-contrast typography, and a "less but better" philosophy. The interface feels intentional and curated, avoiding clutter to allow content and career opportunities to breathe.

Key stylistic markers include:
- **High-Contrast Surfaces:** Sharp transitions between deep navy backgrounds and crisp white foregrounds.
- **Micro-Interactions:** Subtle, fluid transitions that reinforce a sense of high-end craftsmanship.
- **Sophisticated Utility:** Functional elements are presented with clinical clarity, using the primary navy for structural weight and the emerald green for strategic emphasis.

## Colors

The palette is dominated by **Deep Navy (#001A41)**, which serves as the foundation for brand identity, headers, and primary actions. This is contrasted against a **Clean White** base to ensure a professional, high-end feel.

- **Primary (Deep Navy):** Used for typography, brand-heavy surfaces, and primary buttons. It represents authority and stability.
- **Accent (Emerald Green):** Used as a "signal" color. Reserved for success states, active indicators, and high-conversion CTAs. It should occupy less than 5% of the total screen area.
- **Neutral Palette:** A range of Slate Grays (derived from #64748B) provides hierarchy for secondary text and subtle borders.
- **Semantic Colors:** Success (Emerald), Warning (Amber), and Error (Crimson) follow standard conventions but are desaturated to maintain the premium tone.

## Typography

This design system uses a dual-font strategy. **Hanken Grotesk** is used for headlines to provide a sharp, modern edge, while **Inter** is used for body copy and labels to ensure maximum legibility and a systematic feel.

- **Tracking:** Generous tracking (0.01em to 0.05em) is applied to body text and labels to enhance the "premium" feel and prevent the UI from feeling cramped.
- **Hierarchy:** Use weight over color to establish hierarchy. Display titles should almost always use the Primary Navy color.
- **Accessibility:** Line heights are kept generous (minimum 1.5x for body) to support long-form reading in job descriptions.

## Layout & Spacing

The layout utilizes a **Fixed Grid** model for desktop to maintain a controlled, editorial appearance, while transitioning to a **Fluid Grid** for mobile.

- **Desktop (1440px+):** 12-column grid, 1280px max-width, 24px gutters. Content is centered with wide 64px margins to emphasize the premium whitespace.
- **Tablet (768px - 1024px):** 8-column grid, 32px margins.
- **Mobile (<768px):** 4-column grid, 20px margins.

Spacing follows an 8px base unit. For premium layouts, use "Extreme Padding" (unit-xl) between major sections to force focus on specific content blocks. Avoid thin gutters; prefer wider negative space to separate distinct functional areas.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Ambient Shadows**. This design system avoids heavy drop shadows in favor of subtle depth that feels "lit from above."

- **Surface Levels:**
  - Level 0 (Base): White background.
  - Level 1 (Cards/Inputs): Surface-tinted gray or White with a 1px border.
  - Level 2 (Hover/Floating): Subtle 15% opacity shadow, 20px blur, 4px Y-offset, tinted with the primary navy color.
- **Outlines:** Use low-contrast 1px strokes for most containers. Reserve shadows for elements that require immediate user interaction, such as dropdowns or active modals.
- **Overlays:** Modals use a 40% opacity Deep Navy backdrop blur (8px) to maintain brand immersion even when content is obscured.

## Shapes

The shape language is **Organic and Friendly**. A 1rem (16px) base radius is applied to standard components like inputs and buttons to create an approachable yet sophisticated executive brand voice.

- **Standard (1rem):** Checkboxes, small buttons, input fields.
- **Large (2rem):** Cards, modals, feature containers.
- **Pill-shaped:** Used for status "Chips", "Tags", and primary buttons to provide a distinct, modern look.
- **Wordmark container (~13% of height):** The BukieBrainJobs wordmark banner (`wordmark-banner-tight.png`) uses a subtle corner radius of approximately 13% of its height (60px on the 454px asset), matching the glassy button treatment used for primary CTAs. Do not restyle this asset to a sharper box or a fuller pill.

The high roundedness level (Pill-shaped) reinforces a modern, fluid aesthetic that balances the rigid professional typography.

## Components

### Buttons
- **Primary:** Deep Navy background, White text. Pill-shaped. No border. On hover, darken by 10%.
- **Secondary:** Transparent background, Deep Navy 1px border and text. Pill-shaped.
- **Accent:** Emerald Green background, White text. Use only for "Apply Now" or "Submit" actions. Pill-shaped.

### Input Fields
- Use a 1px border. On focus, the border changes to Deep Navy with a 2px outer glow. Labels are always `label-md` and placed above the field. Corners follow the 1rem roundedness.

### Cards
- White background with a 1px border. 2rem corner radius. No shadow in default state; add Level 2 Ambient Shadow on hover to indicate interactivity.

### Chips & Tags
- Used for job categories or skills. Soft gray background with `label-sm` text. Pill-shaped (fully rounded).

### Lists
- Use generous vertical padding (unit-md) between list items. Separate items with a subtle 1px horizontal rule.

### Checkboxes & Radios
- Highly rounded corners for checkboxes; circular for radios. When active, use Emerald Green fill to denote a positive selection state.
