# WEB-001: Public Homepage

**Version:** 1.0
**Status:** Approved
**Design status:** Design orchestration prepared
**Implementation status:** Not started

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

Exact visual composition remains governed by WEB-001A and the approved Stitch design.

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
- Introduce arbitrary design tokens.
- Expose sensitive verification information.

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
