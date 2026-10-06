---
name: BukieBrainJobs Trades Design System (Dual-Theme Canonical)
version: 2.0
status: Canonical Architecture (Approved Dual-Theme Standard)
skill-reference: https://github.com/IceCool30/bukiebrainjobs-trades-design-system
agent-skill-name: bukiebrainjobs-trades-design-system
colors:
  # Light Mode (Architectural Gallery Base)
  surface: '#F7F9FC'
  surface-card: '#FFFFFF'
  surface-hover: '#F2F5FB'
  lead: '#E2E8F0'
  rule: '#CBD5E1'
  text-main: '#001A41'             # Deep Brand Navy (Structural Authority)
  text-muted: '#53647A'            # Steel Grey
  
  # Dark Mode (Obsidian Titanium Base)
  dark-surface: '#0B0E13'
  dark-card: '#13171E'
  dark-card-hover: '#191E27'
  dark-lead: '#202734'
  dark-rule: '#2D3748'
  dark-text-main: '#F0F4F9'        # Platinum Ice
  dark-text-muted: '#8897AB'       # Muted Metallic Silver

  # Brand Core Anchors
  primary-navy: '#001A41'          # Core Structural Navy (Headings, Telemetry, Dispatch)
  brand-green: '#10B981'           # Verification, Escrow Protection, Active Signal
  brand-mint: '#2FE896'            # Dark Mode High-Visibility Fluorescent Glow
  amber-action: '#FF6B35'          # Molten Amber (High-Conversion Action Catalyst)
  amber-hover: '#F15A24'
typography:
  display-lg:
    fontFamily: Cabinet Grotesk, Hanken Grotesk, sans-serif
    fontSize: 48px
    fontWeight: '900'
    lineHeight: 52px
    letterSpacing: -0.04em
    textTransform: uppercase
  headline-md:
    fontFamily: Cabinet Grotesk, Hanken Grotesk, sans-serif
    fontSize: 30px
    fontWeight: '800'
    lineHeight: 36px
    letterSpacing: -0.02em
    textTransform: uppercase
  body-md:
    fontFamily: Inter, sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 25px
  data-mono:
    fontFamily: JetBrains Mono, monospace
    fontSize: 13px
    fontWeight: '600'
    letterSpacing: 0.04em
rounded:
  sm: 4px
  md: 8px
  lg: 12px
---

# BUKIEBRAINJOBS CANONICAL DESIGN SPECIFICATION
**Version:** 2.0 (Dual-Theme Trades Standard)  
**Authority:** Canonical Design Document  
**Reference Skill Repository:** [https://github.com/IceCool30/bukiebrainjobs-trades-design-system](https://github.com/IceCool30/bukiebrainjobs-trades-design-system)

> **CRITICAL NOTICE FOR AI AGENTS & DEVELOPERS:**  
> This project has migrated from the legacy single-theme template to the **BukieBrainJobs Trades Design System**.  
> Whenever an agent or engineer is assigned to build, restyle, or refactor pages, navigation, or component libraries, you **MUST** follow the rules in this document and consult the formal skill:  
> **Skill Name:** `bukiebrainjobs-trades-design-system`  
> **Repository:** `https://github.com/IceCool30/bukiebrainjobs-trades-design-system`  
> **Reference File:** `.skills/bukiebrainjobs-trades-design-system/SKILL.md` (or in global skills at `C:\Users\john.bisong\.gemini\config\skills\bukiebrainjobs-trades-design-system\SKILL.md`).

---

## 1. Dual-Theme Architecture & Color Philosophy

The design system enforces a strict dual-theme model using CSS custom properties (`[data-theme="light"]` and `[data-theme="dark"]`). Do not hardcode static color classes like `bg-white` or `bg-slate-900`. Use the semantic variables below.

### 1.1 Semantic Color Roles

| Semantic Token | Light Mode Value | Dark Mode Value | Purpose & Placement |
| :--- | :--- | :--- | :--- |
| `--bg` | `#F7F9FC` (Gallery Canvas) | `#0B0E13` (Obsidian Gunmetal) | Main viewport canvas |
| `--card-bg` | `#FFFFFF` (Pure White) | `#13171E` (Titanium Charcoal) | Tables, cards, modals |
| `--card-hover` | `#F2F5FB` | `#191E27` | Interactive row hover |
| `--lead` | `#E2E8F0` | `#202734` | Hairline grid borders |
| `--rule` | `#CBD5E1` | `#2D3748` | Boundaries & active edges |
| `--text-main` | `#001A41` (Brand Navy) | `#F0F4F9` (Platinum) | Headlines, primary labels |
| `--text-muted` | `#53647A` (Steel Grey) | `#8897AB` (Metallic Silver) | Descriptions, locations |
| **`--amber`** | **`#FF6B35`** | **`#FF6B35`** | **Action Catalyst (CTAs only)** |
| **`--brand-green`**| **`#10B981`** | **`#2FE896`** | **Trust, Escrow & Telemetry** |
| `--strip-bg` | `#001A41` | `#07090D` | Top telemetry utility bar |
| `--table-header-bg`| `#EEF4FB` | `#0F131A` | Index table column header row |
| `--tag-bg` | `#F1F5F9` | `rgba(255,255,255,0.04)`| Tech stack badges |

### 1.2 The Three Distinct Color Roles
1. **Brand Navy (`#001A41`) as the Structural Anchor**:  
   Used for headlines in light mode, the top telemetry bar, column headers, and the bottom dispatch banner. It anchors the platform with corporate authority.
2. **Brand Green / Mint (`#10B981` / `#2FE896`) as the Trust Signal**:  
   Exclusively represents escrow clearance (`● 100% Escrow Milestone`), live marketplace status (`Live Telemetry Ping`), and verification protocol tags. Never use green for primary action buttons.
3. **Molten Amber (`#FF6B35`) as the Action Catalyst**:  
   Exclusively reserved for primary conversion triggers (`[Post a Job]`, `[Book BrainWorker]`, `[Inspect Spec]`) and hero text emphasis. This delivers high contrast and instant click affordance.

---

## 2. Typography Strategy

BukieBrainJobs uses a disciplined 3-tier typographic pairing:

1. **Display & Headlines (`Cabinet Grotesk` or `Hanken Grotesk`)**:
   - Weight: `800` or `900`.
   - Tracking: `-0.04em` (ultra-tight, muscular, authoritative).
   - Style: Uppercase for hero titles and major section anchors.
2. **Body & Interface (`Inter`)**:
   - Weight: `400` (body), `500` (subheads), `600` (action text).
   - Line height: `1.55` to `1.6` for effortless reading of technical scopes.
3. **Data, Metrics & Telemetry (`JetBrains Mono`)**:
   - Mandatory for reference numbers (`REQ-8820`), tech stack tags (`Mikano 500kVA`), milestone payouts (`₦2,800,000 / mo`), and system latency.

---

## 3. Core Component Blueprint

### 3.1 Segmented Industrial Theme Toggle
Every customer-facing screen features an industrial segmented toggle in the header:
```html
<div class="theme-toggle" role="radiogroup" aria-label="Appearance toggle">
  <button class="theme-toggle-btn active" id="lightBtn" onclick="setTheme('light')">☀ LIGHT</button>
  <button class="theme-toggle-btn" id="darkBtn" onclick="setTheme('dark')">☾ DARK</button>
</div>
```
- Must persist state in `localStorage` under key `bukie_theme`.
- Must honor `prefers-color-scheme` on first visit.

### 3.2 Top Telemetry Utility Strip
- Solid `--strip-bg` (`#001A41` in light, `#07090D` in dark).
- Left: Live pulsing dot (`--brand-green`) + stream status.
- Center: Active verified requisition count.
- Right: Escrow clearance certification (`BukieGuarantee™`).

### 3.3 The Requisition Index (Command Table)
The core discovery interface is a structured command board rather than generic floating cards:
- **Columns**: `REF ID`, `ROLE & TECHNICAL STACK`, `WORKSHOP / LOCATION`, `MILESTONE & ESCROW`, `ACTION`.
- **Row Styling**: High-density rows with clean bottom divider (`--lead`). On hover, highlight with a 3px left border (`--text-main`) and lift the CTA button to solid Molten Amber.
- **Spec Inspector Drawer**: Clicking any requisition opens a modal drawer showing full diagnostic scope, tool requirements, and direct booking triggers.

### 3.4 Verification Protocol Cards
A 3-column trust grid displaying:
1. `Physical Rig & Bench Vetting`
2. `Milestone Escrow Protection`
3. `Direct Engineering Link`
Top border highlights in `--brand-green` on hover.

---

## 4. Implementation Guidelines for Developers & AI Agents

1. **Do Not Revert to Legacy Generic Patterns**:
   Do not introduce pastel gradients, rounded pill buttons with blue backgrounds, or generic card grids. Follow the Requisition Index layout.
2. **Keep Monospace Strict**:
   All rates (`₦`), reference IDs (`REQ-`), and technical stacks must be styled with `font-family: var(--font-mono)`.
3. **Escrow Badges Must Be Green**:
   Any mention of escrow or guarantee protection must be accompanied by the green shield dot: `<span class="shield-dot"></span> 100% Escrow Milestone`.
4. **Action Buttons Must Be Amber**:
   All primary conversion buttons must use `--amber` (`#FF6B35`) with white text and a subtle shadow lift on hover.

For complete HTML/CSS source code and live previews, refer to:
* **Skill Spec**: `C:\Users\john.bisong\.gemini\config\skills\bukiebrainjobs-trades-design-system\SKILL.md`
* **GitHub Repository**: [https://github.com/IceCool30/bukiebrainjobs-trades-design-system](https://github.com/IceCool30/bukiebrainjobs-trades-design-system)
