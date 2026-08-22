# BukieBrainJobs Product Foundation

**Document ID:** PROD-001
**Version:** 1.1
**Status:** Approved foundation

## Product

BukieBrainJobs is a Nigerian two-sided marketplace connecting customers with trusted local service professionals called BrainWorkers.

The platform is intended to make service discovery, matching, booking, communication, payment and accountability safer and more reliable than informal referral channels.

## Platform policy: full product on every surface

BukieBrainJobs is one product. Users may complete the full product on any of these surfaces:

1. **Website** in a desktop or mobile browser (`apps/web`)
2. **PWA** installed from the browser as a standalone web app (`apps/web`)
3. **Native Android and iOS** apps (`apps/mobile`, Expo)

### Policy

- No intentional feature lock-out by surface for core customer or BrainWorker journeys.
- Desktop website is first-class, not a reduced experience.
- PWA is a full alternative for people who do not want store apps.
- Native is a full alternative for people who prefer store apps.
- The same journeys and outcomes ship on all three. Platform tools may strengthen delivery (for example reliable push on native) without removing the journey elsewhere.
- PWA detection means installed or standalone display only. A phone browser is the website, not the PWA shell.

Shared trust rules, booking rules, identity rules, and design system apply across all surfaces.

## Core marketplace paths

### Customer path 1

Find and book a BrainWorker.

### Customer path 2

Post a job and get matched with suitable BrainWorkers.

### BrainWorker path

Become a BrainWorker, complete verification, publish a professional profile and receive relevant work.

## Primary public objective

The public homepage is customer-first.

Primary action:

**Search for a Service**

Secondary marketplace paths:

- Post a Job
- Become a BrainWorker

## Guest experience

Guests can browse and discover services, categories, BrainWorker profiles, reviews, pricing information and trust information before registration.

Authentication should be introduced at the point where an action genuinely requires an account or stronger trust controls.

## Trust model

Trust is a core product capability.

The platform should communicate:

- Professional verification
- Transparent pricing
- Payment protection
- Reliable communication
- Customer protection
- BrainWorker accountability

BrainWorker verification is stronger because BrainWorkers deliver services and may enter customer homes or workplaces. Customer verification can be risk-based and should increase as transaction risk increases.

## Geographic model

Initial geographic architecture:

**36 Nigerian state capitals + Abuja, FCT**

Marketplace activation is controlled. A capital becomes publicly live only after it meets the required supply and service coverage policy.

Unactivated markets should provide a clear coming-soon experience and a notification path rather than falsely presenting unavailable inventory.

## Brand and UX direction

The product uses the approved `DESIGN.md` system with a Corporate Modern and Premium Minimalism direction.

The experience should be:

- Professional
- Friendly
- Dependable
- Modern
- Helpful
- Confident
- Honest
- Efficient

It should not be loud, flashy, overly playful or coldly corporate.

## Product principles

1. Design before development.
2. Systems before screens.
3. Reuse before creating.
4. Mobile first.
5. Trust first.
6. Accessibility by default.
7. Documentation is part of the product.
8. Full product on website, PWA, and native.

## Product roles

- Client
- BrainWorker
- Corporate Client
- Admin
- System

## Major product milestones

1. Product Foundation
2. Design System v1.0
3. Public Website
4. Authentication
5. Customer Platform
6. BrainWorker Platform
7. Booking and Payments
8. Corporate Portal
9. Admin Platform
10. AI Features
11. Production Readiness
12. Launch

## Definition of a complete feature

A feature requires sufficient product, UX, UI, technical, accessibility, security and QA documentation before it is considered implementation-ready.

Core marketplace features are incomplete until the same journey is planned for website, PWA, and native, even when delivery is sequenced over time.
