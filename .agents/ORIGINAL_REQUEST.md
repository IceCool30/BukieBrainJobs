# Original User Request

## 2026-08-05T18:13:42Z

<USER_REQUEST>
Execute Phase A of the BukieBrainJobs Master Redesign Plan (design-plan.md).

Working directory: c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs

Target Deliverables for Phase A:
1. Redesign existing shared UI components in `packages/ui/src/components/`:
   - `Button.tsx` (add loading, disabled, variants, size props)
   - `Card.tsx` (add padding variants, interactive pressable props, header slots)
   - `InputField.tsx` (add label animations, error slots, character counter)
   - `BukiePassportBadge.tsx` (add animated checkmark, tier progression)
   - `EscrowShield.tsx` (add 4 distinct escrow states: Pending Auth, Held, Released, Refunded)

2. Build core new shared components in `packages/ui/src/components/`:
   - `StatusPill.tsx` (color-coded status badge for all 8 TaskStatus types)
   - `PriceBreakdown.tsx` (subtotal, 10% platform fee, 7.5% trust fee, total)
   - `ChatBubble.tsx` (sender, timestamp, security flag alert)
   - `StepIndicator.tsx` (timeline progress stepper)
   - `MetricCard.tsx` (KPI card for wallet & admin)

3. Redesign Web Shells in `apps/web/`:
   - `components/Navbar.tsx` (sticky top bar, brand logo, role switcher pill: Client / Tasker / Admin)
   - `components/Footer.tsx` (4-column responsive footer)
   - `app/not-found.tsx` (custom 404 page)
   - `app/error.tsx` (runtime error boundary)
   - `app/loading.tsx` (skeleton loader)

Strict Constraints:
- Follow `DESIGN.md` tokens (Navy `#001A41`, Emerald `#296A4B` under 5% area, Hanken Grotesk & Inter typography, 32px card radii)
- Maintain 100% Phase 1 mock boundaries (no active backend/API calls)
- Ensure `npm run type-check` passes cleanly with 0 errors upon completion

Begin implementation immediately!
</USER_REQUEST>
