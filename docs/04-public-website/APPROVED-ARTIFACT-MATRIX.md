# Approved Public Website Artifact Matrix

**Status:** Active verification register

| ID | Artifact | Purpose | Status | Foundation requirement |
|---|---|---|---|---|
| WEB-001 | Public Homepage Product & UX Specification | Product behavior and homepage requirements | Approved | Yes |
| WEB-001A | Homepage Section-by-Section Design Brief | Detailed UX/UI design brief | Approved | Yes |
| WEB-001B | Google Stitch Design Requirements | Stitch visual-generation requirements | Deprecated | No |
| WEB-001B-MCP | Antigravity → Stitch MCP Orchestration | Operational design orchestration | Deprecated | No |
| WEB-004 | Public Service Detail | Public service review between discovery and booking preparation | Approved implementation contract | Yes |
| WEB-005 | Public BrainWorker Profile | Guest-accessible profile review for the four featured BrainWorkers with canonical booking context | Approved implementation contract | Yes |
| WEB-006 | Public Services Discovery | Public service discovery, filtering, query synchronization, and recovery | Approved implementation contract | Yes |
| WEB-007 | Public Booking Preparation & Intake Flow | Booking preparation, customer intake, validation, mock submission, and confirmation | Approved implementation contract | Yes |
| WEB-007A | Booking Preparation Design Brief | Section-by-section booking preparation UX/UI design brief | Approved implementation contract | Yes |
| WEB-008 | Authentication & Account Access | Unified authentication, role selection, phone OTP, social login, password recovery, and booking draft handoff | Approved implementation contract | Yes |
| WEB-008A | Authentication Design Brief | Screen-level visual and interaction design brief for authentication | Approved implementation contract | Yes |
| WEB-009 | Customer Job Posting & Request Creation | Customer-led job posting, request intake, validation, authentication handoff, mock submission, and confirmation | Approved product specification | Yes |
| WEB-009A | Customer Job Posting Design Brief | Screen-level visual and interaction design brief for customer job posting | Approved implementation contract | Yes |
| WEB-010 | Customer Dashboard & Authenticated Home Product & UX Specification | Authenticated customer home, hierarchy, navigation, activity states, and integration requirements | Approved product specification | Yes |
| WEB-010A | Customer Dashboard & Authenticated Home Design Brief | Screen-level visual and interaction design brief for the authenticated customer dashboard | Approved implementation contract | Yes |
| WEB-011 | Customer Jobs & Bookings Product & UX Specification | Unified customer activity management, request tracking, and booking history | Approved product specification | Yes |
| WEB-011A | Customer Jobs & Bookings Design Brief | Screen-level visual and interaction design brief for customer jobs and bookings | Approved implementation contract | Yes |

## Locked homepage rules

- Customer discovery is the primary homepage purpose.
- `Search for a Service` is the primary CTA.
- `Post a Job` and `Become a BrainWorker` remain secondary paths.
- Guest discovery is allowed.
- Geographic availability must reflect controlled activation, not implied nationwide live coverage.
- Trust messaging must communicate verification and protection without exposing sensitive identity information.
- The homepage is not the complete booking workflow.

## WEB-007 rules

- `/book` is the public booking preparation route.
- WEB-004, WEB-005, and WEB-006 are upstream journey dependencies.
- Starting price is contextual and must not be represented as a final guaranteed price.
- Preferred BrainWorker context must not imply assignment.
- Payment choices are preferences only. No transaction occurs in WEB-007.
- The slice is mock-first. No production booking record, matching, payment, or authentication enforcement is introduced.
- Query parameters are untrusted input and must be validated safely.
- Human design approval is required before implementation.

## WEB-009 rules

- `/post-job` is the public customer job-posting route.
- WEB-009 supports both specific service requests and broader projects.
- Category selection is encouraged but not mandatory.
- `I'm not sure` is a valid category path.
- Job title and free-form description are the v1 job-description model.
- Preferred BrainWorker is an optional preference only and never implies assignment.
- Successful submission produces a `Request received` state with honest next-step messaging.
- Budget is optional/flexible in v1 and is not a final marketplace quote.
- City is required and must use an active marketplace location.
- Street address is required for submission; landmark is optional but encouraged.
- Customer contact information is obtained through authentication rather than duplicated in the job form.
- Attachments/media uploads remain out of scope for v1.
- A simulated request reference code may be shown on confirmation.
- The slice is mock-first. No production matching, dispatch, notification, payment, booking, KYC, or database persistence is introduced.
- Authentication occurs at the protected commitment point and must preserve the complete job draft.
- Query parameters, saved drafts, and preferred-worker identifiers are untrusted input and must be validated safely.
- Human design approval is required before implementation.

## WEB-010 rules

- WEB-010 is the authenticated customer operational home, not a second marketing homepage.
- `Find a Service` is the primary dashboard action and routes to `/services`.
- `Post a Job` is the secondary dashboard action and routes to `/post-job`.
- Active and upcoming customer work receives priority when present; recent activity remains subordinate.
- First-run customers must see an honest no-activity experience without fabricated bookings, requests, metrics, or activity.
- Desktop authenticated navigation uses a persistent sidebar; mobile/PWA authenticated navigation uses persistent bottom navigation.
- Initial authenticated destinations are Home, Jobs / Bookings, Messages, Notifications, and Profile.
- Wallet is deferred until underlying wallet/payment capability exists; Settings remains within Profile.
- Messages and Notifications must not imply live capability when their underlying functionality is unavailable.
- Required dashboard states include first-run/no activity, active work, upcoming work, recent activity, mixed activity, loading, partial failure, individual section empty, authentication/session failure, and offline/degraded mode.
- The dashboard integrates with existing marketplace journeys and must not duplicate service discovery, service detail, booking preparation, or job posting workflows.
- The slice is mock-first. No new production matching, dispatch, chat infrastructure, push infrastructure, payment processing, wallet transactions, booking lifecycle, review system, KYC workflow, AI recommendations, or analytics-heavy personalization is introduced.
- The Design System v1.0 remains authoritative, including Deep Navy `#001A41` as primary action treatment, Emerald as strategic accent, Hanken Grotesk headlines, Inter body text and labels, approved spacing/radii/components, and WCAG 2.2 AA intent.
- No dashboard-specific foundational visual system may be introduced without an explicit Design System revision.
- Human design approval is required before implementation.

## WEB-011 rules

- `/jobs` is the canonical customer activity route; dashboard navigation item points directly to `/jobs`.
- Legacy `/dashboard?tab=jobs` query safely resolves to `/jobs`.
- Jobs and Bookings are unified into a single customer activity management surface.
- Activity Type (Job Request vs Booking) and Activity Status (Request received, Awaiting progress, Scheduled, In progress, Completed, Cancelled) must never be visually conflated.
- Information prioritization: current/active activity requiring attention, upcoming activity, requests awaiting progress, recent/completed activity, secondary actions.
- Honest marketplace messaging: "Request received" rather than "BrainWorker assigned"; "Booking request prepared" rather than "Service confirmed".
- Desktop uses a 12-column master-detail layout (approx 5/7 columns or 5/1/6) with authenticated sidebar.
- Mobile/PWA uses a dedicated full-screen detail view with 48px minimum touch targets on navigation controls and persistent bottom navigation.
- Initial filters: All, Active, Upcoming, Past, with bidirectional URL query synchronization (`/jobs?view=active`).
- Activity deep linking supported via `/jobs?id=REQ-72941` with customer data scoping, validation, safe not-found handling, and natural browser back/forward history.
- Subtle logo watermark (`/images/logo-badge-512.png` at 3-4% opacity) inside the activity detail container as a non-interactive decorative brand signature without impairing text contrast.
- Primary actions: View details, Return to Dashboard, Continue supported flow, Find a Service, Post a Job. No operational controls for dispatch, payment, live tracking, or messaging.
- First-run experience provides an honest empty state with "Find a Service" and "Post a Job" CTAs, with no fabricated history or metrics.
- Required states: first-run, all activity, active, upcoming, past, job request, booking, selected activity, preferred worker presence/absence, budget presence/absence, reference code presence/absence, filtered empty, loading skeleton, partial failure, full failure, offline/degraded, invalid activity, unknown status, expired session, mobile detail, desktop detail, and reduced motion.
- Continuity preserved across WEB-007 booking preparation, WEB-008 authentication, WEB-009 customer job posting, and WEB-010 customer dashboard.
- The slice is mock-first; no production backend, database persistence, payment processing, or live dispatch is introduced.
- Design System v1.0 remains authoritative: Deep Navy `#001A41` primary/action, Emerald `#296A4B` strategic emphasis, Hanken Grotesk headings, Inter body/UI, approved spacing/radii, and WCAG 2.2 AA intent.
- Human design approval is required before implementation.

## Design workflow

`Product & UX Specification → Design Brief → Agent design review → Antigravity UI design & implementation → QA → Human review & approval`

No implementation artifact should bypass the design review and implementation authorization gates.

> [!NOTE]
> Google Stitch was previously used as an intermediate visual design tool. It is no longer a required part of the production workflow. Current UI design and implementation are performed directly by Google Antigravity using the approved project specifications and DESIGN.md.
