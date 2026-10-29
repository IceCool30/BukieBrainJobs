---
name: bukiebrainjobs-trades-design-system
description: Deprecated historical reference only. Do not use for current BukieBrainJobs visual work. Use the Outlier design skill for web/PWA appearance and THEME-001 for theme mechanics. Native visual restyling remains separately scoped.
---

> **Deprecated, non-authoritative, retained for history.** The rules below describe the retired Trades visual direction. Do not apply or copy them for current website or PWA screens. Use `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md` for appearance and THEME-001 for theme mechanics.

> **THEME-001 (23 October 2026):** light mode is back with one toggle, dark by default. Where this file says dark only or no theme toggle, `docs/specs/THEME-001-light-dark-toggle.md` wins.


# BukieBrainJobs Trades Design System

## Overview
This skill formalizes the **Dark-Only Trades Design System** for BukieBrainJobs. It provides the typography, semantic color tokens, surface architecture, card styling, and motion standards needed to transform and restyle existing BukieBrainJobs pages, components, and views into the approved aesthetic.

---

## 1. Prime Transformation Directive: Reskin, Do Not Invent

When an agent or developer applies this design system to a page or component:

1. **Transform What Exists**:
   Your job is to update the styling, tokens, and typography of existing UI elements so they sit correctly on the dark theme.
2. **Never Inject Unsolicited Components**:
   Do NOT add foreign layout sections that were not requested. Specifically:
   - Do NOT add a Top Telemetry Bar to worker dashboards, customer portals, or settings pages.
   - Do NOT add a Requisition Command Table to booking, lead, or account management screens.
   - Do NOT add landing-page hero banners, manifesto callouts, or fake stat counters to application flows.
   - Do NOT add theme toggles, sun/moon switches, or Appearance settings anywhere.
3. **Preserve Information Architecture & Logic**:
   Keep existing routes, form structures, state management, validations, and interactive logic intact. Change how things look and feel, not what they do.

---

## 2. Single Theme: Obsidian Titanium Gunmetal Dark

Dark is the only approved theme for BukieBrainJobs on the website, the PWA, and the mobile apps. The former light theme (Architectural Gallery Light) was retired in October 2026 and must not be reintroduced, offered as an option, or used for individual pages or sections.

Canvas is deep obsidian gunmetal (`#0B0E13`), card surfaces are dark titanium panels (`#13171E`), dividers are subtle wireframe lines (`#202734`), and primary typography is platinum white (`#F0F4F9`).

### 2.1 Theme Rules
* **Web**: the root layout renders `<html lang="en" data-theme="dark">` as a fixed attribute. Never set or change it from JavaScript.
* **Tokens**: `:root` holds the dark tokens directly. Do not add `[data-theme="light"]` blocks, light token values, or `prefers-color-scheme` branches.
* **No theme switching**: do not add theme toggles, LIGHT/DARK segmented pills, sun/moon icons, Appearance settings rows, theme context providers, or `localStorage` theme keys. Older saved values (`bbj_theme`, `bukie_theme`) are ignored and must stay ignored.
* **Browser chrome and PWA**: viewport `themeColor` and manifest `theme_color` are `#07090D` (the strip colour), manifest `background_color` is `#0B0E13`, and `colorScheme` is `dark`.
* **Mobile (Expo)**: `userInterfaceStyle` is `dark`, the status bar uses `style="light"`, and colours come from `tradesColorTokens.dark` in `packages/ui` whatever the phone's system setting is.
* **Tailwind `dark:` utilities**: the dark variant is bound to `[data-theme="dark"]`, so existing `dark:` classes always apply. New code should use the CSS variables below instead of light/`dark:` class pairs.
* **No light surfaces**: never use `#FFFFFF`, `#F7F9FC`, or other light fills as page, card, input, or modal backgrounds. The white logo tile is part of the logo artwork and is the only exception.

### 2.2 Semantic CSS Variables & Token Architecture
Always use these CSS variables or their Tailwind utility equivalents. Never hardcode arbitrary hex values.

| Token / Variable | Value | Semantic Usage |
| :--- | :--- | :--- |
| `--bg` | `#0B0E13` | Main canvas / page background |
| `--strip-bg` | `#07090D` | Top strips, footers, browser chrome colour |
| `--card-bg` | `#13171E` | Card containers, panels, and dropdown menus |
| `--card-hover` | `#191E27` | Interactive card or table row hover background |
| `--table-header-bg` | `#0F131A` | Table header rows |
| `--lead` | `#202734` | Hairline card borders and subtle section dividers |
| `--rule` | `#2D3748` | Active boundary lines and input field borders |
| `--text-main` | `#F0F4F9` | Primary headings, table row titles, active labels |
| `--text-muted` | `#8897AB` | Secondary descriptions, timestamps, subtext |
| `--amber` | `#FF6B35` | Primary action catalyst (main CTA buttons) |
| `--amber-hover` | `#FF7D4D` | Primary action button hover state |
| `--amber-dim` | `rgba(255, 107, 53, 0.14)` | Amber badge backgrounds, focus glows |
| `--brand-green` | `#2FE896` | Trust badges, verified status, active escrow |
| `--brand-green-dim` | `rgba(47, 232, 150, 0.12)` | Verified badge background tint |
| `--brand-green-border` | `rgba(47, 232, 150, 0.35)` | Verified badge hairline border |
| `--danger` | `#FF6B6B` | Destructive actions, errors, failed states |
| `--danger-dim` | `rgba(255, 107, 107, 0.1)` | Danger surface tint |
| `--danger-border` | `rgba(255, 107, 107, 0.3)` | Danger hairline border |
| `--brand-navy` | `#001A41` | Core brand anchor identity (logo artwork only, never text on dark) |
| `--tag-bg` | `rgba(255, 255, 255, 0.04)` | Metadata pills and category tags |
| `--tag-border` | `rgba(255, 255, 255, 0.08)` | Metadata pill borders |
| `--tag-text` | `#BAC9DC` | Metadata pill label text |

### 2.3 Readability Floor
Dark screens pick up more glare outdoors, and BrainWorkers often check leads on site. Text must stay at or above these contrast ratios, measured on `--card-bg`:

| Text token | Contrast on `#13171E` |
| :--- | :--- |
| `--text-main` | 16.3:1 |
| `--brand-green` | 11.2:1 |
| `--amber` | 6.3:1 |
| `--text-muted` | 6.0:1 |

Do not use greys dimmer than `--text-muted` for readable text, and do not fade readable text with opacity. WCAG AA requires at least 4.5:1 for body text.

### 2.4 Brand Watermarks
Decorative watermarks use `/images/logo-watermark.png` (the white B-and-swoosh silhouette without the app tile) at `0.03` to `0.04` opacity, placed inside a card. Never use the full white app tile as a watermark, and never fix a watermark to the viewport over page content.

---

## 3. Typography Hierarchy

The typography pairs three distinct type families deliberately:

### 3.1 Display Headings (`Cabinet Grotesk` or fallback `Hanken Grotesk`)
* **Role**: Primary page titles, section headers, card titles.
* **Weights**: 800 (Bold) or 900 (Black).
* **Tracking**: `-0.03em` to `-0.04em` (compact, muscular, authoritative).
* **Usage**: Clean uppercase or title case for high-impact titles. Never use decorative script or generic fonts.

### 3.2 Body & Interface Controls (`Inter`)
* **Role**: Form inputs, paragraphs, descriptions, modal copy, navigation labels.
* **Weights**: 400 (Regular), 500 (Medium), 600 (Semi-Bold).
* **Line Height**: `1.5` to `1.6` for clean readability across desktop and mobile.

### 3.3 Telemetry, Codes & Financial Data (`JetBrains Mono`)
* **Role**: Reference codes (`BK-9021`), currency values (`₦45,000`), status pills, technical parameters, timestamps, counters.
* **Weights**: 500 (Medium) or 600 (Semi-Bold).
* **Tracking**: `0.02em` to `0.05em`.
* **Rule**: Always render currency amounts, codes, and telemetry metrics in monospace.

---

## 4. Component Transformation Guide

Apply these visual patterns to restyle existing UI components:

### 4.1 Cards & Containers
* Background: `var(--card-bg)`.
* Border: `1px solid var(--lead)`.
* Border Radius: `4px` (subtle industrial) to `8px` (standard card).
* Padding: Generous and structured (`1.25rem` to `1.75rem`).
* Interactive Hover: Transition background to `var(--card-hover)` with a slight hairline contrast lift on hover.

### 4.2 Buttons & Action Triggers
* **Primary Interactive Button (Action Catalyst)**:
  - Background: `var(--amber)` (`#FF6B35`).
  - Text: `#FFFFFF`, bold, uppercase tracking (`0.04em`), font: `JetBrains Mono` or `Inter`.
  - Border: `1px solid var(--amber)`.
  - Hover: `var(--amber-hover)` with a subtle `-1px` transform lift.
* **Secondary / Ghost Button**:
  - Background: `var(--card-bg)`.
  - Text: `var(--text-main)`.
  - Border: `1px solid var(--lead)`.
  - Hover: Background shifts to `var(--card-hover)` with border brightening to `var(--rule)`.
* **Danger / Destructive Button**:
  - `var(--danger-dim)` surface with `var(--danger)` text and `var(--danger-border)` border; never use amber for destructive actions.

### 4.3 Tables & Data Lists
* Header Row: Background `var(--table-header-bg)`, text uppercase monospace in `var(--text-muted)`.
* Row Borders: Hairline `1px solid var(--lead)`.
* Row Hover: Background `var(--card-hover)`.
* Reference IDs / Monetary Values: Formatted in `JetBrains Mono`.

### 4.4 Status Badges & Pills
* **Verified / Escrow / Success**:
  - Background: `var(--brand-green-dim)`.
  - Text: `var(--brand-green)`.
  - Border: `1px solid var(--brand-green-border)`.
  - Font: `JetBrains Mono` (0.7rem, uppercase).
* **Neutral / Tag**:
  - Background: `var(--tag-bg)`.
  - Text: `var(--tag-text)`.
  - Border: `1px solid var(--tag-border)`.

### 4.5 Form Controls & Inputs
* Background: `var(--card-bg)`.
* Text: `var(--text-main)`.
* Border: `1px solid var(--rule)`.
* Focus Ring: `2px solid var(--amber)` with `var(--amber-dim)` outer glow.
* Placeholder: `var(--text-muted)`.

---

## 5. Motion & Micro-Interactions

* **Transition Timing**: Standard transitions must be snappy: `0.18s` to `0.25s ease`. Transition only the properties that change on interaction (background, border, color, transform); there is no theme cross-fade.
* **Accessibility**: Always respect user motion preferences:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

---

## 6. Verification Checklist for Reskinned Screens

Before concluding any design transformation task, verify:
- [ ] No unsolicited components were added (no unauthorized telemetry bars, requisition tables, or landing heroes).
- [ ] The screen matches Obsidian Titanium Gunmetal (`#0B0E13` canvas, `#13171E` cards, `#F0F4F9` text).
- [ ] No light tokens, light surfaces, theme toggle, Appearance setting, `prefers-color-scheme` branch, or theme storage key was added.
- [ ] Primary CTA buttons use Molten Amber (`#FF6B35`).
- [ ] Trust, escrow, and verification badges use Brand Green (`#2FE896`).
- [ ] Readable text meets the floor in section 2.3.
- [ ] Monetary figures (`₦`), codes, and telemetry tags use `JetBrains Mono`.
- [ ] Headings use `Cabinet Grotesk` with tight tracking.
- [ ] All forms, buttons, links, and interactive logic remain fully functional.

---

## 7. Reference Blueprints (Illustrative Only)

The `references/` directory contains complete static reference implementations, both dark-only:
* `references/index.html`: Reference implementation of the dark CSS variable architecture.
* `references/aerodyne.html`: Thematic demonstration of high-density technical cards and typography.

These files serve as visual guides for tokens and styling. Do not copy their page-specific layout components into unrelated BukieBrainJobs screens.
