# WEB-012A: Customer Job Matching & BrainWorker Match Results Design Brief

**Document ID:** WEB-012A  
**Version:** 1.0  
**Status:** Draft for Independent Design Review  
**Product:** BukieBrainJobs  
**Primary user:** Authenticated customer  
**Parent feature:** WEB-012  
**Implementation model:** Production-first, deterministic mock adapter  
**Design authority:** `DESIGN.md`

## 1. Purpose

Translate the approved WEB-012 Product & UX Specification into screen-level visual and interaction requirements for customer job matching and BrainWorker match results.

This brief authorizes design work only. It does not authorize engineering implementation.

The experience must make one distinction unmistakable:

> A BrainWorker match is a suitable candidate, not an assignment, acceptance, booking, payment, or dispatch.

## 2. Source Authority

Apply the repository's canonical authority model with the following feature-specific distinction:

1. Approved live BukieBrainJobs experience and bundled experience standards govern practical visual and interaction behavior.
2. `DESIGN.md` governs foundational visual tokens and rules.
3. Approved WEB-012 Product & UX Specification governs product behavior, terminology, claims, and user journeys.
4. This WEB-012A Design Brief translates those authorities into feature-specific design requirements.
5. Existing approved customer patterns from WEB-008, WEB-009, WEB-010, and WEB-011 provide supporting continuity where they do not conflict with the higher authorities above.

The live approved experience and bundled experience standards are the practical source for how the product should behave and feel. `DESIGN.md` remains authoritative for foundational color, typography, spacing, grid, shape, elevation, components, motion, and accessibility rules. The current system uses Deep Navy `#001A41`, restrained Emerald signaling, Hanken Grotesk headlines, Inter interface/body text, a 1280px desktop container, 24px gutters, 20px mobile margins, and an 8px base spacing unit.

WEB-012 remains authoritative for matching behavior, terminology, customer-safe claims, lifecycle semantics, and journey requirements. This brief must not override those product decisions.

Do not introduce competing visual tokens or redesign the foundation.

## 3. Experience Architecture

```text
Dashboard
   ↓
Jobs / Bookings
   ↓
Job Request Detail
   ↓
View Matches
   ↓
Match Results
   ↓
BrainWorker Profile / Match Detail
   ↓
Select / Express Interest, when lifecycle supports it
   ↓
Future acceptance / booking lifecycle
```

Follow existing route conventions. Do not expose internal matching identifiers or sensitive data in URLs.

## 4. Core Screens

### 4.1 Match Entry / Job Context

Establish request context before presenting candidates.

Show, where available:
- Job title
- Customer reference code
- Service/category context
- Location at customer-safe precision
- Requested schedule
- Budget preference, without presenting it as a final quote
- Short description/context
- Current matching status

Primary action: **View matches** when results are available.

### 4.2 Matching In Progress

Required:
- Clear status heading
- Brief explanation
- Job context
- Non-blocking progress treatment
- Safe return path to Jobs / Bookings

Do not fabricate worker cards. Provide retry only when supported by the contract.

### 4.3 Match Results

Desktop may use a two-column structure with result list and persistent job/context summary. Preserve the 1280px container and grid discipline.

Mobile uses a single-column result flow with compact job context and individually scannable match cards.

A match card may contain only supported public data:
- BrainWorker name
- Public photo/avatar
- Public verification/approval indicator when supported
- Relevant services/skills
- Rating/completed-work summary when supported
- Service area
- Availability compatibility when supported
- Rate/pricing when supported
- Customer-safe match explanation
- View profile / match detail
- Selection/interest action only when the lifecycle supports it

Never expose internal ranking scores, risk signals, verification documents, NIN, BVN, private phone numbers, or proprietary ranking weights.

### 4.4 BrainWorker Match Detail

Reuse established public BrainWorker profile patterns rather than inventing a separate worker identity system.

Emphasize:
- Why the BrainWorker is relevant
- Public professional information
- Service/skill fit
- Availability or service-area fit where supported
- Pricing/rate where supported
- Customer-safe explanation
- Clear next action

## 5. Match Explanation Pattern

Explanations should be short, factual, and customer-safe.

Conceptual examples:
- Matches your requested service
- Available for your requested schedule
- Serves your location
- Fits your flexible budget
- Highly rated for this type of work

Do not reveal numerical ranking scores, hidden weights, internal eligibility rules, risk classifications, or sensitive verification outcomes.

## 6. Selection Lifecycle

Use one canonical action for a given lifecycle state.

When a durable customer selection/preference is supported:

**Select BrainWorker**

When the contract supports only an expression of interest:

**Express interest**

Do not show both for the same state.

After successful selection/interest:
- Confirm exactly what the customer did.
- Show the resulting selected/interest state.
- Explain that this does not mean the BrainWorker accepted the request.
- Do not imply booking, payment, appointment, dispatch, or completion unless separately supported.

If selection is not connected, show an honest unavailable/non-actionable state instead of fake success.

## 7. Freshness and Stale Results

Only represent freshness when the underlying contract supplies freshness information.

### Current results
Normal result presentation.

### Refresh available
Provide refresh/retry when matching can be requested again.

### Stale results
If results are explicitly stale:
- Label them as needing refresh.
- Do not imply current availability, pricing, or ranking.
- Preserve prior results for context where safe.
- Provide **Refresh matches** when supported.

### No freshness metadata
Do not invent timestamps, expiration periods, countdowns, or “live matches” claims.

### Refreshing
Keep the customer anchored to job context and avoid destructive replacement of useful results unless required by the contract.

## 8. Eligibility Information Boundary

Eligibility processing is an internal marketplace concern.

The customer-facing experience may show:
- Customer-safe match explanations
- Aggregate/no-match explanations approved by the product contract
- Public worker attributes explicitly eligible for display

Never expose:
- Internal rejection reasons
- Verification documents or document details
- NIN/BVN or equivalent identity data
- Internal risk/fraud signals
- Proprietary ranking inputs or weights
- Private contact details
- Cross-customer information

Excluded candidates should not receive invented internal explanations.

## 9. Required States

Design distinct treatments for:

1. Matching in progress
2. Matches available
3. No suitable matches yet
4. No matches for current constraints
5. Partial/degraded match data
6. Matching service failure
7. Offline/degraded network
8. Authentication/session failure
9. Invalid/expired job context
10. Stale results
11. Refresh in progress
12. Selection/interest pending
13. Selection/interest success
14. Selection/interest failure

No-match and technical failure must never use the same semantic treatment.

## 10. No-Match Recovery

Where supported, offer:
- Adjust schedule
- Review/edit request
- Adjust flexible budget
- Return to job activity
- Continue waiting
- Find a Service as an alternative discovery path

Keep the tone constructive and non-blaming.

## 11. Content and Tone

Use the established BukieBrainJobs style:
- Clear
- Human
- Helpful
- Concise
- Professional
- Confident

Avoid technical matching jargon, unsupported guarantees, “guaranteed match” language, premature assignment language, and unsupported escrow/protection claims.

## 12. Interaction Requirements

- Match cards are independently actionable and keyboard navigable.
- Selection/interest actions expose clear pending, success, and failure feedback.
- Matching progress and meaningful state changes are accessible to assistive technologies.
- Focus moves predictably after state changes.
- Filters/sorts, if contractually supported, are accessible and preserve context.
- Status never relies on color alone.
- Reduced-motion preferences are respected.
- Interactive targets follow the approved accessibility baseline.

## 13. Responsive Requirements

### Mobile
- 20px page margins.
- Single-column result cards.
- Compact persistent job context.
- No horizontal scrolling.
- Actions remain easy to reach.

### Tablet
- Use the approved tablet grid and spacing system.
- Preserve result scanning and context hierarchy.
- Treat tablet as an explicit responsive variant within the design set, not merely as an intermediate breakpoint.

### Desktop
- Maximum content width 1280px.
- 12-column layout where appropriate.
- Generous whitespace and strong editorial hierarchy.

Follow existing tokens rather than screen-specific spacing values.

## 14. Visual Direction

The experience should feel premium, calm, trustworthy, and precise.

Use Deep Navy for primary structure and actions, Emerald sparingly for positive/active signals, white/light surfaces for hierarchy, restrained borders, approved rounded cards, Hanken Grotesk for major headings, Inter for body/interface content, and subtle motion only when it improves comprehension.

Do not create a visually separate matching product. It must feel native to the existing BukieBrainJobs customer platform.

## 15. Trust and Privacy

Trust comes from accurate information and clear boundaries, not exaggerated badges.

Public verification indicators may be shown only when supported by the public profile contract.

Never imply that BukieBrainJobs has guaranteed the worker, insured the job, that the worker has accepted the job, that payment is protected, or that an appointment is confirmed unless an approved production contract supports that claim.

## 16. Mock-First Design Boundary

Design the complete production-oriented experience while honestly representing unconnected capabilities.

The deterministic mock adapter may provide:
- Match candidates
- Eligibility outcomes
- Ranking order
- Customer-safe explanations
- Selection/interest states
- Loading/failure fixtures

The design must remain compatible with future database/API-backed matching.

Do not design around fake operational side effects such as real notifications, dispatch, payment, booking creation, or production worker assignment.

## 17. Design Deliverables

1. Match entry/context screen
2. Matching-in-progress state
3. Match results screen
4. Match card variants
5. BrainWorker match detail/profile handoff
6. No-match state
7. Technical failure state
8. Partial/degraded state
9. Offline/degraded state
10. Stale-results state
11. Refresh state
12. Selection/interest pending state
13. Selection/interest success state
14. Selection/interest failure state
15. Invalid/expired job context
16. Mobile variants
17. Tablet variants
18. Desktop variants
19. Accessibility-focused interaction states

The mobile, tablet, and desktop variants together form the responsive design set for the feature.

## 18. Independent Design Review Checklist

Verify:
- WEB-012 intent is preserved.
- Match does not visually imply assignment.
- Selection does not imply acceptance or booking.
- Freshness is truthful and never fabricated.
- Eligibility exposure is customer-safe.
- No sensitive identity or internal risk data appears.
- No-match and technical failure are distinct.
- Existing BrainWorker profile patterns are reused.
- Existing customer navigation patterns are preserved.
- `DESIGN.md` tokens are followed.
- Mobile, tablet, and desktop layouts work.
- Keyboard and assistive-technology states are represented.
- Reduced-motion behavior is accounted for.
- Mock-first behavior does not weaken the production-oriented UX contract.

## 19. Approval Boundary

This design brief is **not implementation authorization**.

Required sequence:

```text
WEB-012 Product & UX Specification
        ↓
Product approval
        ↓
WEB-012A Design Brief
        ↓
Independent Design Review
        ↓
Implementation Authorization
        ↓
Antigravity Implementation
        ↓
Independent Implementation Review
        ↓
Merge
        ↓
Production Verification
```

## Status

**READY FOR INDEPENDENT DESIGN REVIEW**
