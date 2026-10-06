# BukieBrainJobs Design System v2.0 (Dual-Theme Canonical Standard)

**Document ID:** DS-000  
**Version:** 2.0 (Dual-Theme Trades Standard)  
**Status:** Locked & Canonical  
**Official Skill Repository:** [https://github.com/IceCool30/bukiebrainjobs-trades-design-system](https://github.com/IceCool30/bukiebrainjobs-trades-design-system)  
**Agent Skill Name:** `bukiebrainjobs-trades-design-system`  

---

## Authority & Developer Guidance

The root `DESIGN.md` and this document represent the **official design authority** for BukieBrainJobs. 

All agents, engineers, and designers working on customer-facing features, discovery interfaces, or design token packages must align with the **BukieBrainJobs Trades Design System**.

> **POINTER TO SKILL REPOSITORY:**  
> Before building or refactoring any screens, developers and agents should inspect the reference code and component implementations in:  
> - **GitHub Repo:** `https://github.com/IceCool30/bukiebrainjobs-trades-design-system`  
> - **Local Skill Path:** `C:\Users\john.bisong\.gemini\config\skills\bukiebrainjobs-trades-design-system\SKILL.md`  
> - **Reference Implementation:** `index.html` (in the skill repo) for exact markup of the telemetry bar, segmented theme toggle, command index table, and spec inspector modal.

---

## Approved Core Visual Rules

1. **Dual-Theme Engine**:
   - **Light Mode (`[data-theme="light"]`)**: Architectural Gallery Off-White (`#F7F9FC`) with crisp pure white card chambers (`#FFFFFF`) and deep Brand Navy text (`#001A41`).
   - **Dark Mode (`[data-theme="dark"]`)**: Obsidian Titanium Gunmetal (`#0B0E13` / `#13171E`) with platinum display typography (`#F0F4F9`) and razor-sharp hairline borders (`#202734`).
2. **Three-Tier Color Discipline**:
   - **Structural Anchor**: Deep Navy (`#001A41`) for headings, top telemetry panel, and footer dispatch container.
   - **Trust & Escrow**: Brand Green (`#10B981` in light, `#2FE896` in dark) for escrow milestone verification badges, telemetry indicators, and vetting tags.
   - **Action Catalyst**: Molten Amber (`#FF6B35`) strictly for primary conversion buttons (`[Book BrainWorker]`, `[Post Requisition]`, `[Inspect Spec]`) and hero accents.
3. **Typography**:
   - **Display / Headings**: `Cabinet Grotesk` (or `Hanken Grotesk`) at 800/900 weight, uppercase, ultra-tight tracking (`-0.04em`).
   - **Body**: `Inter` for clean reading copy and form controls.
   - **Technical Data**: `JetBrains Mono` for `REQ-` codes, milestone pricing (`₦`), and hardware stack tags.
4. **Layout & Discovery Pattern**:
   - **Requisition Index Command Table**: Replaces generic floating card grids with an engineered, high-density discovery index table with live filtering pills and an instant spec-inspection drawer.
5. **Theme Switcher**:
   - Industrial segmented switcher (`[ ☀ LIGHT | ☾ DARK ]`) with `localStorage` persistence.

---

## Token Resolution & Conflict Prevention

An older specification previously mapped single-theme values without dark-mode support. The approved mapping is now:

| Token Name | Light Mode | Dark Mode | Semantic Role |
| :--- | :--- | :--- | :--- |
| `primary` | `#001A41` | `#001A41` | Structural Navy |
| `surface` | `#F7F9FC` | `#0B0E13` | Canvas background |
| `card` | `#FFFFFF` | `#13171E` | Card surface |
| `action` | `#FF6B35` | `#FF6B35` | Molten Amber CTA |
| `trust` | `#10B981` | `#2FE896` | Escrow & Verification |

---

## Design Gate
No screen or component may introduce competing color palettes (e.g. generic purple or cyan gradients) or revert to single-theme templates without an explicit revision to this design system.
