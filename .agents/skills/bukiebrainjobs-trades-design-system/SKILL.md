---
name: bukiebrainjobs-trades-design-system
description: Design system and dual-theme transformation engine (Architectural Gallery Light & Obsidian Titanium Gunmetal Dark) for BukieBrainJobs. Guides agents and engineers in restyling existing UI components, pages, cards, typography, and interactive states to the approved design system without injecting unsolicited layout components.
---

# BukieBrainJobs Trades Design System

## Overview
This skill formalizes the **Architectural Dual-Theme Design System** for BukieBrainJobs. It provides the typography, semantic color tokens, surface architecture, card styling, and motion standards needed to transform and restyle existing BukieBrainJobs pages, components, and views into the approved aesthetic.

---

## 1. Prime Transformation Directive: Reskin, Do Not Invent

When an agent or developer applies this design system to a page or component:

1. **Transform What Exists**:
   Your job is to update the styling, tokens, typography, and theme compatibility of existing UI elements.
2. **Never Inject Unsolicited Components**:
   Do NOT add foreign layout sections that were not requested. Specifically:
   - Do NOT add a Top Telemetry Bar to worker dashboards, customer portals, or settings pages.
   - Do NOT add a Requisition Command Table to booking, lead, or account management screens.
   - Do NOT add landing-page hero banners, manifesto callouts, or fake stat counters to application flows.
3. **Preserve Information Architecture & Logic**:
   Keep existing routes, form structures, state management, validations, and interactive logic intact. Change how things look and feel, not what they do.

---

## 2. Dual-Theme Engine (Light & Dark)

The design system operates on a dual-theme architecture with full CSS variable mapping. All surfaces, borders, and text colors must adapt cleanly between light and dark modes.

### 2.1 Theme Modes
* **Architectural Gallery Light (`[data-theme="light"]`)**:
  Canvas is gallery architectural off-white (`#F7F9FC`), card surfaces are crisp pure white (`#FFFFFF`), dividers are clean hairline slate (`#E2E8F0`), and primary typography is authoritative Brand Navy (`#001A41`).
* **Obsidian Titanium Gunmetal Dark (`[data-theme="dark"]`)**:
  Canvas is deep obsidian gunmetal (`#0B0E13`), card surfaces are dark titanium panels (`#13171E`), dividers are subtle wireframe lines (`#202734`), and primary typography is platinum white (`#F0F4F9`).

### 2.2 Semantic CSS Variables & Token Architecture
Always use these CSS variables or their Tailwind utility equivalents. Never hardcode arbitrary hex values.

| Token / Variable | Light Mode | Dark Mode | Semantic Usage |
| :--- | :--- | :--- | :--- |
| `--bg` | `#F7F9FC` | `#0B0E13` | Main canvas / page background |
| `--card-bg` | `#FFFFFF` | `#13171E` | Card containers, panels, and dropdown menus |
| `--card-hover` | `#F2F5FB` | `#191E27` | Interactive card or table row hover background |
| `--lead` | `#E2E8F0` | `#202734` | Hairline card borders and subtle section dividers |
| `--rule` | `#CBD5E1` | `#2D3748` | Active boundary lines and input field borders |
| `--text-main` | `#001A41` | `#F0F4F9` | Primary headings, table row titles, active labels |
| `--text-muted` | `#53647A` | `#8897AB` | Secondary descriptions, timestamps, subtext |
| `--amber` | `#FF6B35` | `#FF6B35` | Primary action catalyst (main CTA buttons) |
| `--amber-hover` | `#F15A24` | `#FF7D4D` | Primary action button hover state |
| `--amber-dim` | `rgba(255, 107, 53, 0.08)` | `rgba(255, 107, 53, 0.14)` | Amber badge backgrounds, focus glows |
| `--brand-green` | `#10B981` | `#2FE896` | Trust badges, verified status, active escrow |
| `--brand-green-dim` | `rgba(16, 185, 129, 0.1)` | `rgba(47, 232, 150, 0.12)` | Verified badge background tint |
| `--brand-green-border` | `rgba(16, 185, 129, 0.35)` | `rgba(47, 232, 150, 0.35)` | Verified badge hairline border |
| `--brand-navy` | `#001A41` | `#001A41` | Core brand anchor identity |
| `--tag-bg` | `#F1F5F9` | `rgba(255, 255, 255, 0.04)` | Metadata pills and category tags |
| `--tag-border` | `#E2E8F0` | `rgba(255, 255, 255, 0.08)` | Metadata pill borders |
| `--tag-text` | `#001A41` | `#BAC9DC` | Metadata pill label text |

### 2.3 Theme Switcher Pattern
When a theme toggle is present on a screen or in user preferences:
* Use a segmented pill (`LIGHT` / `DARK`) or a compact sun/moon toggle.
* Persist the active selection to `localStorage` under the key `bbj_theme`.
* Set `data-theme="light"` or `data-theme="dark"` on the `html` root element.

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
  - Hover: Background shifts to `var(--card-hover)` with border darkening to `var(--rule)`.
* **Danger / Destructive Button**:
  - Muted red surface with clear red text and border; never use amber for destructive actions.

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

* **Transition Timing**: Standard transitions must be snappy: `0.18s` to `0.25s ease`.
* **Theme Switching**: Apply smooth cross-fade to backgrounds, borders, and text colors during theme toggle:
  ```css
  * {
    transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
  }
  ```
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
- [ ] Light mode matches Architectural Gallery Light (`#F7F9FC` canvas, `#FFFFFF` cards, `#001A41` text).
- [ ] Dark mode matches Obsidian Titanium Gunmetal (`#0B0E13` canvas, `#13171E` cards, `#F0F4F9` text).
- [ ] Primary CTA buttons use Molten Amber (`#FF6B35`).
- [ ] Trust, escrow, and verification badges use Brand Green (`#10B981` / `#2FE896`).
- [ ] Monetary figures (`₦`), codes, and telemetry tags use `JetBrains Mono`.
- [ ] Headings use `Cabinet Grotesk` with tight tracking.
- [ ] All forms, buttons, links, and interactive logic remain fully functional.

---

## 7. Reference Blueprints (Illustrative Only)

The `references/` directory contains complete static reference implementations:
* `references/index.html`: Reference implementation demonstrating the CSS variable architecture and dark/light mode toggle mechanics.
* `references/aerodyne.html`: Thematic demonstration of high-density technical cards and typography.

These files serve as visual guides for tokens and styling. Do not copy their page-specific layout components into unrelated BukieBrainJobs screens.
