# WEB-001B-MCP: Antigravity to Stitch MCP Homepage Orchestration

**Status:** Approved operational prompt
**Product artifact:** WEB-001
**Design foundation:** DS-001 through DS-012
**Stitch project:** Premium Navy Design System

## Mission

Use the connected Stitch MCP to generate the approved BukieBrainJobs public homepage design. This is a design-generation task, not an engineering task.

## Authority

Read in this order:

1. `DESIGN.md`
2. DS-001 through DS-012
3. `docs/04-public-website/APPROVED-HOMEPAGE-ARTIFACTS.md`
4. WEB-001
5. WEB-001A
6. WEB-001B
7. This prompt

If instructions conflict, the higher authority wins. Do not invent a product decision to resolve a conflict.

## Do not implement

Do not write application code, APIs, database code, authentication, payments, booking logic, job-posting logic, BrainWorker onboarding, or production infrastructure during Stitch generation.

## Design system

The foundation is locked for v1.0. Use the existing tokens and approved components. Deep Navy is primary, Emerald is strategic emphasis, Hanken Grotesk is for display and headings, and Inter is for body and interface content. Follow the approved 12/8/4-column responsive grid, 1280px maximum content width and 24px standard gutters.

## Brand assets

Use the actual supplied BukieBrainJobs logo assets available to the connected workspace and Stitch project. Do not redraw, regenerate, approximate, recolor, distort or replace the logo.

## Product hierarchy

The homepage is customer-first.

Primary CTA: **Search for a Service**

Secondary pathways:
- **Post a Job**
- **Become a BrainWorker**

Guests may browse without registration.

Search begins with service and location. Date and time are introduced later in booking.

## Geographic behavior

The platform has 37 initial geographic markets: 36 Nigerian state capitals plus Abuja, FCT. Markets use controlled activation. Unactivated markets must show a coming-soon state and notification option instead of false marketplace availability.

## Homepage sections

Generate and refine these in controlled passes:

1. Announcement bar
2. Navigation
3. Hero and service/location search
4. Popular services
5. How BukieBrainJobs works
6. Why choose BukieBrainJobs
7. Featured BrainWorkers
8. Post a Job
9. Trust and Safety
10. Become a BrainWorker
11. Testimonials
12. Corporate Solutions
13. Mobile App
14. FAQ
15. Community/newsletter
16. Footer

## Trust rules

Show public trust signals such as Identity Verified, verified professionals, secure payments, transparent pricing and platform protection. Never expose NIN, BVN, government ID numbers or private verification records.

Customer verification is risk-based and should not be presented as a universal requirement for browsing.

## Content rules

Do not fabricate real customer testimonials, ratings, completed-job counts or marketplace statistics. Use clearly illustrative content if production data is unavailable.

## Accessibility

Apply DS-010 and WCAG 2.2 AA. Ensure semantic hierarchy, keyboard access, visible focus, accessible forms, adequate contrast, touch-friendly controls and reduced-motion behavior.

## Motion

Use the approved subtle, purposeful motion system. Do not use decorative animation that interferes with comprehension or conversion.

## MCP execution

Use controlled passes instead of attempting an uncontrolled one-shot homepage generation:

1. Foundation, navigation and hero
2. Discovery sections
3. Trust and BrainWorker sections
4. Conversion and supporting sections
5. Responsive refinement
6. Accessibility and visual QA

After each pass, compare the result against the approved artifacts. Refine only where the refinement remains within the approved specifications.

## Stop condition

When the homepage satisfies the approved product, design, responsive, accessibility and brand requirements, stop and request human design review.

Do not proceed to engineering implementation. WEB-001C is created only after human approval of the Stitch design.
