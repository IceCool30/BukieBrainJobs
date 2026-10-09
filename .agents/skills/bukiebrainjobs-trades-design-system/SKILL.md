---
name: bukiebrainjobs-trades-design-system
description: Complete design system, dual-theme architecture (Architectural Light & Obsidian Titanium Dark), typography, token system, and requisition index layout specification for BukieBrainJobs. Use when designing, building, or refactoring BukieBrainJobs customer-facing pages, discovery views, landing screens, or component libraries to ensure exact aesthetic fidelity.
---

# BukieBrainJobs Trades Design System

## Overview
This design system formalizes the approved **Architectural Dual-Theme Design** for BukieBrainJobs. It bridges the authority of an engineered technical requisition board with Bukie's trusted marketplace standards (escrow milestones, workshop vetting, and direct technician booking).

Use this skill whenever any agent or engineer is asked to implement, restyle, or extend BukieBrainJobs screens, landing pages, or components to match the approved experience exactly.

---

## 1. Design Principles & Character

1. **Grounded in Physical Competence**:
   BukieBrainJobs serves high-value technical hands (Diesel Generator Overhaulers, High-Voltage Solar Microgrids, Industrial PLC Automators, Commercial HVAC Leads, Precision Trades). The interface looks like a precision instrument panel, not generic SaaS marketing slop.
2. **Authority Through Structure**:
   High-density information hierarchy using structured tabular data (`Ref ID`, `Role & Stack`, `Location`, `Milestone & Escrow`, and direct action triggers).
3. **Restraint & Dual-Theme Harmony**:
   - **Light Mode**: Gallery architectural off-white (`#F7F9FC`) with crisp pure white card surfaces (`#FFFFFF`) and deep Brand Navy typography (`#001A41`).
   - **Dark Mode**: Obsidian Titanium Gunmetal (`#0B0E13` / `#13171E`) with razor-sharp wireframe dividers and platinum text (`#F0F4F9`).
   - **Action Catalyst**: Molten Amber (`#FF6B35`) is reserved strictly for primary interactive actions and the hero accent.
   - **Verification & Security**: Brand Green (`#10B981` / `#2FE896`) is reserved for trust badges, escrow clearance, and the pulsing live telemetry beacon.

---

## 2. Color Palette & Semantic Token Architecture

All implementations **must** use semantic CSS variables mapping seamlessly between `[data-theme="light"]` and `[data-theme="dark"]`.

| Semantic Variable | Light Mode Value | Dark Mode Value | Intended Usage |
| :--- | :--- | :--- | :--- |
| `--bg` | `#F7F9FC` | `#0B0E13` | Root canvas surface |
| `--card-bg` | `#FFFFFF` | `#13171E` | Card surfaces, board background |
| `--card-hover` | `#F2F5FB` | `#191E27` | Interactive table row hover |
| `--lead` | `#E2E8F0` | `#202734` | Hairline structural dividers |
| `--rule` | `#CBD5E1` | `#2D3748` | Active boundary lines |
| `--text-main` | `#001A41` | `#F0F4F9` | Display titles, table row titles |
| `--text-muted` | `#53647A` | `#8897AB` | Secondary descriptions, locations |
| `--amber` | `#FF6B35` | `#FF6B35` | Primary CTA buttons, action catalyst |
| `--amber-hover` | `#F15A24` | `#FF7D4D` | CTA button hover state |
| `--brand-green` | `#10B981` | `#2FE896` | Escrow badges, telemetry live beacon |
| `--strip-bg` | `#001A41` | `#07090D` | Top telemetry utility bar |
| `--strip-text` | `#D6E4F5` | `#9FB2C8` | Top telemetry label text |
| `--table-header-bg`| `#EEF4FB` | `#0F131A` | Index table column header row |
| `--tag-bg` | `#F1F5F9` | `rgba(255,255,255,0.04)` | Tech stack tags |
| `--dispatch-bg` | `linear-gradient(...)` | `linear-gradient(...)` | Bottom callout container |

---

## 3. Typography Hierarchy

Three distinct type roles must be paired deliberately:

1. **Display Headings**: `Cabinet Grotesk` (weights: 800, 900)
   - *Alternative fallback*: `Hanken Grotesk` (weight 800)
   - Tracking: `-0.04em` (ultra-tight, muscular, authoritative)
   - Transform: Uppercase for primary hero headlines and board titles.
2. **Body & Controls**: `Inter` (weights: 400, 500, 600, 700)
   - Line height: `1.55` - `1.6` for readable descriptions and manifesto copy.
3. **Telemetry & Technical Codes**: `JetBrains Mono` (weights: 500, 600, 700)
   - Used for `REQ-8820` reference codes, stack tags, compensation amounts (`₦2,800,000 / mo`), filter pills, and telemetry indicators.

---

## 4. Key UI Components & Anatomy

### 4.1 Top Telemetry Bar
- Height: Compact (`0.55rem 1.5rem`).
- Left item: Pulsing green/mint indicator (`7px` circle with pulse animation) + live market status.
- Middle item: Active verified requisition counter.
- Right item: `Escrow Security: BukieGuarantee™`.

### 4.2 Header & Brand Navigation
- Left: BukieBrainJobs wordmark banner image (`36px` height) paired with a monospace border-left tag: `VERIFIED TRADES INDEX`.
- Center/Right: Monospace navigation links (`MARKET`, `VERIFICATION`).
- Right Toggle: **Segmented Industrial Theme Switcher**:
  ```html
  <div class="theme-toggle" role="radiogroup">
    <button class="theme-toggle-btn active" id="lightBtn" onclick="setTheme('light')">☀ LIGHT</button>
    <button class="theme-toggle-btn" id="darkBtn" onclick="setTheme('dark')">☾ DARK</button>
  </div>
  ```
- Right CTA: Ghost button (`POST REQUISITION`) + Amber button (`ACCESS BOARD`).

### 4.3 Hero Section
- Left column (60%):
  - Monospace eyebrow with green dot: `● VERIFIED INFRASTRUCTURE & TECHNICAL HANDS`.
  - Display H1: `THE REQUISITION INDEX FOR <span class="accent">HANDS THAT BUILD</span>.`
  - Direct, confident thesis statement without corporate filler.
- Right manifesto box (40%):
  - Left border anchor (`3px solid var(--text-main)`).
  - 2-column stat lockup (`₦3.2M Avg Milestone` / `100% Escrow Protected`).
  - Clear escrow guarantee statement.

### 4.4 The Requisition Index (Command Table)
- **Station Toolbar**: Filter pills for technical disciplines (`Power Generation`, `Solar & Inverters`, `Plant Automation`, `Industrial HVAC`) + live filtered counter.
- **Header Row**: Monospace uppercase headers (`REF ID`, `ROLE & TECHNICAL STACK`, `WORKSHOP / LOCATION`, `MILESTONE & ESCROW`, `ACTION`).
- **Data Rows**:
  - `REQ-XXXX` code in monospace.
  - Role title in bold Cabinet Grotesk + tech stack tags in neutral monospace pills.
  - Workshop entity name + Nigerian city location (e.g. `Ikeja, Lagos // Industrial Bay 04`).
  - Exact milestone compensation (`₦2,800,000 / mo`) + green escrow badge (`● 100% Escrow Milestone`).
  - Action CTA button: `INSPECT SPEC` (turns solid amber on row hover).

### 4.5 Spec Inspection Modal (Drawer)
- Backdrop blur overlay.
- Technical project scope, verified tooling requirements, milestone value, and `Submit Credentials / Book Opportunity` action.

### 4.6 Verification Protocol Cards
- 3-column card grid explaining:
  1. `Physical Rig & Bench Vetting` (Calibrated diagnostic gear).
  2. `Milestone Escrow Protection` (Funds locked before commencement).
  3. `Direct Engineering Link` (Direct link to workshop lead).
- Green corner marker on card hover.

---

## 5. Implementation Rules for Developers & Agents

1. **Never Revert to Pure Generic White or Uncalibrated Black**: Always use the defined CSS variables (`--bg`, `--card-bg`, `--brand-navy`, `--brand-green`, `--amber`).
2. **Preserve Monospace Data**: Never render reference codes, tech tags, or monthly rates in standard sans-serif; keep them in `JetBrains Mono`.
3. **Escrow Badges Must Remain Green**: Security and verification indicators must always use `--brand-green` (`#10B981` in light, `#2FE896` in dark).
4. **Primary CTAs Must Remain Amber**: Do not change the primary action buttons to blue or grey; they must remain Molten Amber (`#FF6B35`) for high-contrast action clarity.
5. **Reduced Motion**: Respect `prefers-reduced-motion` by disabling the beacon pulse and modal transitions when requested.
