# BukieBrainJobs Brand Guide

**Status:** Authoritative source of truth for brand assets. Approved by founder, Solomon Bukie (Aug 12, 2026).

This document governs all brand asset usage across the web app, mobile app, documentation, and marketing materials. All developers and agents MUST pull logos from the folders defined below. Do NOT recreate, trace, generate, or redesign logos. Use the canonical sizes already provided.

> **Scope note, 29 October 2026:** This guide remains authoritative for approved logo files, asset handling, and brand identity. Its color examples do not define current web/PWA component tokens. Use `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md` for web/PWA appearance and THEME-001 for theme mechanics. Native visual restyling remains separately scoped.

## The Two Logo Variants

| Variant | Files | When to Use |
|---|---|---|
| **White Rounded B App Icon (PRIMARY)** | `logo-appicon-3d-2048.png` | App icons, favicons, PWA icons, splash screens, social profile pictures, store listings |
| **Landscape Wordmark (PREFERRED FOR BRANDING)** | `wordmark-banner-tight.png` (web), `wordmark-banner-2280.png` (print/OG master) | Navbar, hero section, footer brand column, OpenGraph/social sharing, email headers, any place where the full company name should appear |
| Flat 2D mark (fallback, legacy) | `logo-appicon-1200.png`, `logo-mark-384.png` | Only as a fallback when the 3D version cannot render |

## Master Assets

The masters live in `docs/06-brand/assets/`. They are the highest-resolution originals. All derived sizes are generated from them by running `python3 docs/06-brand/generate-assets.py`.

| File | Description | Dimensions | Primary Use |
|---|---|---|---|
| `logo-appicon-3d-2048.png` | White strongly rounded-square tile containing the navy B and green swoosh, with transparent outer edges | 2048x2048 | Source for all icons and derived sizes |
| `logo-appicon-3d.svg` | Vector version of the 3D badge | vector | Future-proofing; scaling to any size losslessly |
| `wordmark-banner-tight.png` | Tight wordmark: 3D badge tile + "BukieBrainJobs" navy text on an independent white container with a subtle corner radius (~60px), no surrounding background or canvas | 1888x454 | Canonical wordmark across the website (Navbar, Footer, Hero) and master export for other developers |
| `wordmark-banner-2280.png` | Master export of the landscape wordmark on a full canvas (includes soft shadow band) | 2280x684 | Print, OpenGraph/social sharing, source for future derivations |
| `logo-appicon-1200.png` | Flat 2D badge | 1200x1200 | Fallback variant |
| `logo-mark-384.png` | Flat 2D transparent mark | 384x384 | Fallback variant |

## Where Derived Assets Live

| App | Folder | Contents |
|---|---|---|
| Web | `apps/web/public/` | `favicon.ico` (multi-size 16/32/48/64) |
| Web | `apps/web/public/icons/` | `icon-{64..512}.png`, `icon-maskable-{192,512}.png`, `apple-touch-icon-180x180.png`, `windows11/*` |
| Web | `apps/web/public/images/` | `logo-icon.png` (192), `logo-mark-384.png` (384), `logo-badge-512.png`, `wordmark-banner-tight.png` (1888x454, canonical), `wordmark-banner-2280.png` (master), `og-banner-1200x630.png` |
| Mobile | `apps/mobile/assets/images/` | `logo-icon.png`, `logo-main.png` (512), `logo-hero.png` (600), `wordmark-banner.png` (2280), `splash-icon.png` (1024) |

## Usage Rules

1. **Preferred lockup:** the landscape wordmark (`wordmark-banner-tight.png`) is preferred wherever the brand appears prominently on the website. It contains the full company name and should not be cropped.
2. **Icons and favicons:** always generated from `logo-appicon-3d-2048.png` using `generate-assets.py`, never from the flat variants. Reusable logo images retain transparency outside the white rounded tile. Installed web, PWA, Apple, and Windows icons use an opaque white canvas so platforms do not add an unintended dark or coloured background.
3. **Wordmark artwork shape:** the canonical asset has an intrinsic corner radius of about 13% of its height. Preserve the asset without recropping or reshaping it, but do not use its geometry as a rule for page components. Current component radii follow the Outlier skill.
4. **Independent white container:** the canonical `wordmark-banner-tight.png` is the white container with the badge and text only. It has no surrounding background or baked canvas. When placed on navy surfaces (Navbar, Footer), let the component's own background show around it; do not wrap it in an extra white box. Older versions that include a large baked white or shadowed canvas must not be used.
5. **Dark background alternative:** do not introduce a separate coloured field around the B. Use the approved rounded white tile and let the surrounding surface remain visible through its transparent outer edges.
6. **Social sharing / OpenGraph:** use `og-banner-1200x630.png` (1200x630, the minimum OG size), built from the landscape wordmark on a white canvas.
7. **No re-creation:** if a size not listed here is needed, add it via `generate-assets.py`, then update this table.
8. **Cleanup rule:** only the canonical sizes listed above should exist in `public/` and `assets/images/`. Older unused sizes should be deleted, and duplicated uploads should never be committed.

## Brand Identity Colors, Not UI Tokens

| Token | Hex | Use |
|---|---|---|
| Primary Navy | `#001A41` | Logo identity and navy structural roles where current Outlier components specify them |
| Emphasis Green | `#296A4B` | Logo swoosh and semantic success/status roles where current product patterns specify them; not a primary CTA token |
| Light Green | `#ABEEC8` | Brand artwork and retained identity material; not a current web/PWA UI token unless Outlier maps it |
| White | `#FFFFFF` | Logo tile background, wordmark banner background |
