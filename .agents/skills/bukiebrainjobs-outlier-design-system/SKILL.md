---
name: bukiebrainjobs-outlier-design-system
description: The current visual-system authority for BukieBrainJobs web and PWA design. Use for any customer-facing screen, component, theme appearance, color, typography, surface, radius, button, responsive visual, or screenshot review. Defines Outlier tokens and patterns from the live CSS while preserving THEME-001 theme behavior and the separate experience, accessibility, and content standards.
---

# BukieBrainJobs Outlier Design System

## Purpose and scope

Use this skill as the sole authority for BukieBrainJobs visual tokens and theme appearance on the website and PWA. It extends the approved Outlier landing-page direction across the product without turning every screen into a marketing page.

This skill does not authorize backend, database, authentication, payment, API, or native-screen changes. A shared coral-token effect on native code was separately approved, but native screen restyling remains deferred unless the owner approves it.

## Authority

- This skill defines visual identity, palette, typography, surfaces, radius, button treatment, and component appearance.
- `docs/specs/THEME-001-light-dark-toggle.md` defines theme mechanics and toggle placements. Preserve its dark default, explicit light selection, saved preference, and existing single-toggle placement. Do not add a toggle to every route or invent a new appearance setting.
- Product and feature specifications define user journeys, copy, states, and behavior. Do not change them while restyling.
- `bukiebrainjobs-experience-standards` remains authoritative for general task hierarchy, responsive behavior, accessibility, motion, content density, and quality checks. It does not define a competing palette or theme.
- `DESIGN.md` is a supporting layout and spacing reference only where it does not conflict with this skill or THEME-001.
- `apps/web/app/globals.css` is the implementation source for current token values. Inspect the relevant token and component use before changing it. If code and an approved requirement conflict, surface the conflict and update the approved source rather than inventing a compromise.
- The former `bukiebrainjobs-trades-design-system` skill and its static HTML examples are deprecated historical material. Do not follow or copy their dark-only rules, palette, or component prescriptions.

## Upstream complete reference

The full source engine is the [Outlier visual skill engine repository](https://github.com/IceCool30/outlier-ai-visual-skill-engine), on its `main` branch. Read the upstream [`SKILL.md`](https://github.com/IceCool30/outlier-ai-visual-skill-engine/blob/main/SKILL.md) for deeper token and component rationale. Useful source files include [`design-tokens.json`](https://github.com/IceCool30/outlier-ai-visual-skill-engine/blob/main/design-tokens.json), [`downstream-prompt.md`](https://github.com/IceCool30/outlier-ai-visual-skill-engine/blob/main/downstream-prompt.md), [`styles/tokens.css`](https://github.com/IceCool30/outlier-ai-visual-skill-engine/blob/main/styles/tokens.css), [`tailwind.config.js`](https://github.com/IceCool30/outlier-ai-visual-skill-engine/blob/main/tailwind.config.js), and the [`components/` directory](https://github.com/IceCool30/outlier-ai-visual-skill-engine/tree/main/components).

The upstream repository documents the broader source design. For BukieBrainJobs implementation, this customized local skill and the live `apps/web/app/globals.css` take precedence; feature specifications govern product behavior, and THEME-001 governs dark/light behavior and toggle placement. Upstream assumptions such as light-only surfaces, generic fonts, extra patterns, or broad mobile/native rules must not override this project's adaptation, approved feature specifications, or native-scope boundary. Do not import or copy upstream code or assets into this repository without separate approval.

## Visual foundation

Use theme-aware semantic CSS variables and existing component classes. Do not add raw hex colors to individual screen components or create a parallel palette.

| Role | Dark | Light |
|---|---|---|
| Page canvas (`--bg`) | `#0B0E13` | `#F7F9FC` |
| Card surface (`--card-bg`) | `#13171E` | `#FFFFFF` |
| Main text (`--text-main`) | `#F0F4F9` | `#001A41` |
| Muted text (`--text-muted`) | `#8897AB` | `#53647A` |
| Semantic action/text amber (`--amber`) | `#F7803C` | `#C2410C` |
| Amber hover (`--amber-hover`) | `#FF8D4D` | `#9A3412` |
| Green status (`--brand-green`) | `#2FE896` | `#296A4B` |
| Header strip (`--strip-bg`) | `#07090D` | `#001A41` |

The Outlier accent is coral `#F7803C`, with hover `#FF8D4D` and dim surface `rgba(247, 128, 60, 0.12)`. In light mode, semantic amber text remains the deeper `--amber` value for contrast. Primary marketing pill fills use the Outlier coral token with navy text. Do not use coral as the page canvas, broad section background, or trust-status color.

Green remains a theme-aware semantic status color. Use it through `--brand-green` for existing success, verification, and trust patterns. Do not hard-code a green value or replace a semantic state with coral.

## Typography, spacing, and geometry

- Display and headline text use `Cabinet Grotesk`, with `Hanken Grotesk` as the configured fallback.
- Body, navigation, and interface text use `Inter`.
- Codes and financial figures use `JetBrains Mono` where the existing component pattern calls for it.
- Use the spacing and radius tokens in `globals.css`. The content maximum is 1280px, with 64px desktop margins and 20px mobile margins.
- Dense operational screens use the compact radius scale. Existing geometry is 4px for compact controls and 8px for standard cards. Do not apply marketing banner or card radii to dashboards, tables, leads, bookings, wallets, or forms.
- Marketing sections may use the Outlier radii already defined in CSS: 48px banner, 36px sub-banner, and 20px card on wider screens. At widths up to 809.98px they become 24px, 20px, and 16px. Preserve the existing breakpoint and do not transfer those values to operational components.
- `.outlier-pill-button` is fully rounded, with its existing 180ms transform feedback. Reserve it for the established Outlier marketing and primary-action patterns. Dense operational controls should retain their compact geometry.

## Header and photography

Preserve the fixed desktop header and its existing theme-aware `--strip-bg` treatment with light navigation text. The strip is navy in light mode and near-black in dark mode. Keep its existing position, content, and theme-toggle placement. Do not replace the header background with coral.

Keep fixed light text over photography only where the existing photo-led pattern calls for it. Maintain the navy or dark image overlays that make that text readable, keep faces and practical work visible, and check the composition in both themes. Do not transfer photo-overlay text styles to ordinary surfaces.

## THEME-001 behavior

- Dark is the first-visit default. A stored value of `light` selects light mode; missing or invalid values resolve to dark.
- The web preference key is `bbj_theme_mode`. The root `data-theme` and `dark` class represent the selected mode. Do not substitute device color preference for the saved choice.
- Preserve the existing accessible toggle label and THEME-001 placements: public desktop navigation, public phone/PWA menu drawer, signed-in account navigation, and the approved native placement. Do not add duplicate toggles or move it into every page header.
- Preserve the existing browser-bar color behavior: dark uses `#07090D`; light uses `#001A41`.
- Use theme tokens for all theme-dependent surfaces, text, borders, focus, and states. Check both saved modes instead of inferring appearance from only one theme.

## Component and accessibility rules

- Use coral pill CTAs where the Outlier pattern calls for a clear primary marketing action. Keep secondary and destructive actions distinct. Coral is not a substitute for success, verification, or warning semantics.
- Keep operational cards and controls compact. Preserve data density and decision support on dashboards, bookings, leads, wallet, onboarding, and profile screens.
- Preserve modal blur only where an existing product pattern uses it and the operational content remains clear. Do not add broad glass effects or blur over working content.
- Keep one page-level `h1` per route and use `h2` for section titles. Preserve the heading text and styling when correcting semantics.
- Meet applicable WCAG 2.2 AA contrast requirements in both themes. Keep keyboard focus visible, controls named, headings logical, and essential states understandable without color alone.
- Verify phone, tablet, and desktop widths when layout changes. Fix the specific source of overflow. Never mask a layout defect with global `overflow-x: hidden`.
- Respect reduced-motion preferences and use the existing motion tokens. Motion must not shift layout or obscure content.

## Implementation and review

1. Identify the page task, platform, route family, current theme, and nearest existing component pattern.
2. Read the relevant sections of this skill, THEME-001, and the general experience standard.
3. Inspect the CSS token and component implementation before editing. Preserve behavior, routes, copy, API contracts, mock stores, and state.
4. Make the smallest visual change that uses the current tokens and component patterns.
5. For cross-product UI work, review affected route families in both themes and at desktop, tablet, and phone sizes. Inspect populated operational states when those routes carry data.
6. Run focused accessibility, lint, type, test, and build checks relevant to the change. Report routes or states that could not be inspected.

If a needed visual choice is not established in this skill, `globals.css`, or an approved product reference, ask the owner instead of adding a new token or pattern by assumption.
