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

## Design workflow

`Product & UX Specification → Design Brief → Agent design review → Antigravity UI design & implementation → QA → Human review & approval`

No implementation artifact should bypass the design review and implementation authorization gates.

> [!NOTE]
> Google Stitch was previously used as an intermediate visual design tool. It is no longer a required part of the production workflow. Current UI design and implementation are performed directly by Google Antigravity using the approved project specifications and DESIGN.md.
