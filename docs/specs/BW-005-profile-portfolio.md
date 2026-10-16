# BW-005 BrainWorker Profile and Portfolio Management

**Document ID:** BW-005  
**Version:** 1.0  
**Status:** Approved  
**Primary Route:** `/brainworker/profile`  
**Item Reference:** Master Checklist Item 2.7  

---

## 1. Purpose and Architectural Summary

BW-005 establishes the professional profile, showcase portfolio, and reputation counter-response workspace for approved artisans (BrainWorkers) on BukieBrainJobs.

The feature empowers artisans to manage their public-facing trade credentials, display verified before-and-after visual evidence of completed jobs, and address client feedback via constructive counter-responses. In accordance with platform security and architecture guidelines, this surface enforces strict physical tenant isolation, sanitization against XSS, and absolute financial decoupling (zero exposure of wallet balances, escrow accounts, bank settlement credentials, or Nigerian Naira transaction values).

---

## 2. Domain Invariants and Specifications (PROF-001 to PROF-010)

The pure domain layer (`apps/web/lib/brainworker/profile/domain.ts`) governs all profile, portfolio, and review entities:

1. **PROF-001 (Profile Input Sanitization and Length Limits):**
   - Headline: trimmed string, HTML and script tags stripped, min length 3 chars, max length 100 chars.
   - Bio: trimmed string, HTML and script tags stripped, min length 10 chars, max length 1,000 chars.
2. **PROF-002 (Experience Range Enforcement):**
   - `yearsOfExperience` must be an integer between 0 and 50 inclusive.
3. **PROF-003 (Recognized Nigerian Languages):**
   - At least one language is required.
   - Permitted languages are restricted to canonical Nigerian lingua: English, Nigerian Pidgin, Yoruba, Hausa, Igbo, Edo, Tiv, and Ibibio.
4. **PROF-004 (Avatar Headshot URL Validation):**
   - Must be `null` or a secure HTTPS URL ending in approved image extensions (`.jpg`, `.jpeg`, `.png`, `.webp`) or hosted on trusted storage domains.
5. **PROF-005 (Profile Completeness Calculation):**
   - Weighted milestones: headline (20%), bio (20%), experience (15%), languages (15%), headshot (15%), and at least one portfolio item (15%). Total = 100%.
   - Returns percentage, boolean `isComplete`, and explicit missing milestones array.
6. **PROF-006 (Portfolio Item Input Validation):**
   - Requires non-empty title (max 80 chars), category, completedDate in ISO format, and valid HTTPS `afterImageUrl`. Optional HTTPS `beforeImageUrl`.
7. **PROF-007 (Portfolio 20-Item Cap):**
   - Hard cap of 20 portfolio items per artisan (`MAX_PORTFOLIO_ITEMS = 20`). Rejects attempts to add more items once cap is reached.
8. **PROF-008 (Customer Review Domain Structure):**
   - Reviews require id, bookingId, customerId, workerId, rating (1 to 5 stars), criteria scores, review body, and publication status.
9. **PROF-009 (Review Counter-Response Rules):**
   - Counter-response text must be 10 to 500 characters.
   - One response per review.
   - Counter-responses attach to the review without mutating customer rating or review text.
10. **PROF-010 (Strict Financial Decoupling):**
    - Domain models strictly forbid financial fields (`walletBalance`, `escrowNgn`, `bankAccount`, `payoutAmount`).

---

## 3. Repository Contracts and Tenant Isolation (REP-001 to REP-010)

The repository layer (`apps/web/lib/brainworker/profile/repository.ts`) provides partitioned persistence:

1. **REP-001 (Physical Tenant Isolation):**
   - All collections (`profiles`, `portfolio`, `reviews`) are partitioned strictly by `workerId`.
2. **REP-002 (Safe Default Profile Seeding):**
   - Uncustomized artisans receive a safe default profile (`spokenLanguages: ['English']`, `yearsOfExperience: 0`).
3. **REP-003 (Profile Mutation Persistence):**
   - Profile updates are sanitized, validated against domain contracts, and persisted per worker.
4. **REP-004 (Scoped Portfolio CRUD):**
   - `getPortfolio`, `addPortfolioItem`, and `deletePortfolioItem` strictly enforce the calling artisan tenant boundary.
5. **REP-005 (Cap Rejection at Repository Boundary):**
   - Attempting to add a 21st portfolio item throws an error.
6. **REP-006 (Reverse Chronological Sorting):**
   - Portfolio items are sorted newest first by `completedDate`.
7. **REP-007 (Before/After Image Integrity):**
   - Before and after image URLs are preserved and validated upon storage.
8. **REP-008 (Reviews Partitioning):**
   - Reviews are strictly queried by artisan `workerId`.
9. **REP-009 (Non-Destructive Counter-Response Attachment):**
   - Attaches `artisanResponse` with timestamp without modifying customer score or body.
10. **REP-010 (Financial Sanitization Guarantee):**
    - Repository read operations strip any accidental financial metadata before returning.

---

## 4. Trades Design System UI Components (COMP-001 to COMP-012)

The UI component suite (`apps/web/components/brainworker/profile/`) adheres to the Trades Design System dual theme:

1. **ProfileEditorForm (`COMP-001` to `COMP-004`):**
   - Inputs for avatar URL, headline, bio, and experience stepper.
   - Multi-select chips for recognized Nigerian languages (`aria-pressed`).
   - Profile completeness progress meter with missing milestone badges.
   - Submits sanitized updates to `onSaveProfile`.
2. **PortfolioGalleryManager (`COMP-005` to `COMP-009`):**
   - Responsive card grid displaying project title, category, date, and after-image.
   - Before and after toggle button for dual-image work samples.
   - Add work modal dialog with form validation.
   - 20-item cap indicator with disabled state when max reached.
   - Deletion confirmation dialog invoking `onDeletePortfolioItem`.
3. **ReviewsCounterResponseTab (`COMP-010` to `COMP-011`):**
   - Customer reviews feed with 5-star rating display and criteria breakdown.
   - Artisan response card with timestamp when response exists.
   - Public counter-response form with 500-char limit counter for unresponded reviews.
4. **ProfileManagementWorkspace (`COMP-012`):**
   - Master tabbed container switching between Profile Details, Portfolio Gallery, and Client Reviews.
   - Zero wallet balances, escrow accounts, or financial metrics.

---

## 5. Route Integration and Security Gates (ROUTE-001 to ROUTE-010)

The protected route (`apps/web/app/brainworker/profile/page.tsx`) implements 4 access gates:

1. **Gate 1 (Unauthenticated Visitor):**
   - Redirects to `/login?redirect=/brainworker/profile` without calling repository methods (`ROUTE-001`).
2. **Gate 2 (Customer Role Guard):**
   - Renders fail-closed boundary card (`Customer Account Detected` / `Access Restricted`) without repository queries (`ROUTE-002`).
3. **Gate 3 (Unapproved Provider Guard):**
   - Redirects unapproved artisans to `/brainworker/verification-status` (`ROUTE-003`).
4. **Gate 4 (Approved Provider Workspace):**
   - Mounts `ProfileManagementWorkspace` with live repository data (`ROUTE-004`).
   - All queries bound to session `userId` (`ROUTE-005`).
   - Action delegates: save profile (`ROUTE-006`), add work (`ROUTE-007`), delete work (`ROUTE-008`), counter-response (`ROUTE-009`).
5. **SSR Mount Safety and Decoupling:**
   - Pre-renders `BukieBrainJobs` shell during SSR without throwing (`ROUTE-010`).
   - Zero financial symbols (`₦`, `NGN`) or currency fields on the page.

---

## 6. Verification Metrics

- **Domain Contracts (`domain.test.ts`):** 10/10 passed.
- **Repository Contracts (`repository.test.ts`):** 10/10 passed.
- **UI Component Contracts (`ProfileUI.test.tsx`):** 12/12 passed.
- **Route Integration Contracts (`BrainWorkerProfileRoute.test.tsx`):** 10/10 passed.
- **Total Profile Suite:** 42/42 contracts passed.
- **Monorepo Web Suite:** 1,588/1,588 tests passed with zero regressions.
- **Production Build:** Static page generated at `/brainworker/profile` (10.3 kB).
