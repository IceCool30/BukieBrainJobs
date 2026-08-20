# WEB-001: Public Homepage

**Version:** 1.1
**Status:** Approved and live
**Design status:** Live-first experience standard approved
**Implementation status:** Live on `feature/web-001-homepage-redesign` and continuously deployed through Vercel previews

## Objective

The public homepage is the primary entry point to BukieBrainJobs. Its primary job is to move customers into service discovery while exposing the other marketplace entry paths without creating confusion.

## Audience hierarchy

Primary:

- Customers looking for a service

Secondary:

- Customers who want to post a job
- Professionals who want to become BrainWorkers

## CTA hierarchy

### Level 1

**Search for a Service**

### Level 2

- Post a Job
- Become a BrainWorker

### Level 3

Supporting actions such as profile discovery, reviews, business solutions and help.

## Hero

The primary interaction is a lightweight **Service + Location** search.

Date and time are introduced later in the booking journey.

The homepage must not become a full booking form.

The live implementation uses a two-tier hero search: a full-width service query row followed by a location selector and search button row. Live suggestions open below the field and include real service imagery.

## Geographic model

Initial architecture:

- 36 Nigerian state capitals
- Abuja, FCT

Use controlled activation.

### Active capital

Show normal marketplace discovery.

### Unactivated capital

Show:

- Coming Soon
- Notify Me

### Unsupported non-capital location

Explain that the service is not yet available in the selected city and provide recovery actions.

Do not silently redirect users.

## Guest discovery

Guests can:

- Browse categories
- Search services
- View BrainWorker profiles
- View reviews
- View pricing information
- Learn about trust and safety

Do not force registration before discovery.

## Three marketplace paths

### Find and book

Customer searches for a service, selects a location, discovers suitable BrainWorkers, reviews profiles and proceeds into booking.

### Post a job

Customer describes the work required and receives relevant matching opportunities.

### Become a BrainWorker

Qualified professionals can learn about creating a profile, listing services, setting rates, controlling availability, completing verification and receiving jobs.

## Trust

The homepage should communicate:

- Verified BrainWorkers
- Secure payments
- Transparent pricing
- Customer support
- BukiePassport
- BukieGuarantee

Do not expose sensitive verification records.

Customer trust should also be acknowledged, but customer verification must not be presented as identical to BrainWorker verification.

## Homepage sections

The approved design brief covers:

1. Announcement / navigation
2. Hero and service search
3. Trust strip
4. Popular services
5. How BukieBrainJobs Works
6. Why Choose BukieBrainJobs
7. Featured BrainWorkers
8. Post a Job
9. Trust and Safety
10. Become a BrainWorker
11. Testimonials
12. Corporate Solutions
13. Mobile App promotion
14. FAQ
15. Community / newsletter
16. Footer

Exact visual composition is now governed by the live-first experience standard at `docs/02-design-system/LIVE-EXPERIENCE-STANDARD.md` and the bundled skill at `docs/02-design-system/skills/bukiebrainjobs-experience-standards/`.

The live homepage includes:

- A photo-led hero with navy vignettes controlling depth around the edges
- The approved headline about booking skilled local or remote workers in minutes
- Image-led service cards with starting-price labels
- A three-brand trust strip: Paystack, Flutterwave, and Dojah
- BrainWorker terminology standardized across all customer-facing copy
- A compact, service-focused mobile PWA composition with a photo-governed hero and restrained motion

All subsequent pages must follow the live-first experience standard.

## Responsive requirements

- Desktop: 12-column grid
- Tablet: 8-column grid
- Mobile: 4-column grid
- Maximum content width: 1280px
- Standard gutter: 24px
- Mobile margin: 20px

Mobile is a first-class composition, not a shrunken desktop layout.

## Accessibility

Follow WCAG 2.2 AA.

Required:

- Keyboard navigation
- Visible focus states
- Semantic hierarchy
- Accessible labels
- Screen-reader compatibility
- Sufficient contrast
- Appropriate touch targets
- Accessible search suggestions
- Accessible location controls
- Meaningful errors
- Reduced-motion support

## Guardrails

Do not:

- Make all three marketplace paths equally dominant.
- Force registration before discovery.
- Claim nationwide live availability without activation.
- Add map functionality to the hero.
- Overload the hero with fields.
- Use generic stock imagery.
- Turn the homepage into a dashboard.
- Do not introduce arbitrary design tokens.
- Expose sensitive verification information.
- Use unsupported absolute claims such as exact counts, ratings, guarantees, or coverage amounts in customer-facing copy
- Introduce a bottom navigation bar on the homepage
- Place decorative statistics, heavy blur, or broad frosted-glass panels on any page

## Open operational decisions

These are deliberately not invented here:

- Exact activation thresholds for each capital
- Final customer verification implementation
- Specific geolocation provider
- Final production copy

## Acceptance criteria

A new visitor should be able to understand quickly:

1. What BukieBrainJobs is.
2. What services are available.
3. How to search.
4. Where services are available.
5. How BrainWorkers are trusted.
6. How payments are protected.
7. How to post a job.
8. How to become a BrainWorker.
9. What happens after booking.
