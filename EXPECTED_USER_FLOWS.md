# BukieBrainJobs: Expected User Flows & QA Blueprint
*A Premium, Chat-First, Gen Z Targeted Job Marketplace for Nigeria*

---

## 🎨 Design Philosophy & UX Guiding Principles

BukieBrainJobs is tailored for a mobile-first, high-vibrancy Nigerian Gen Z audience. Our design stands out through **Intentional Motion**, **High-Density Information Cards**, and a **Snappy Chat Interface** that feels like a messaging client rather than a clinical database directory.

### ⚡ Key UX Directives:
* **Micro-interactions**: Subtle tactile scale-downs (`whileTap={{ scale: 0.95 }}`) on buttons, smooth height expansions (`framer-motion` height transitions), and skeleton loaders with custom shimmering gradients.
* **Gen Z Aesthetic**: High contrast layout, deep obsidian backdrops with crisp emerald-green accents (`bg-brand-green`), elegant modern sans-serif typography paired with monospaced data tags for structural layout honesty.
* **Frictionless Transitions**: Page-level fade-ups and slide-ins that make the PWA feel like a high-performance native application.

---

## 🧭 Core Product User Flows

### Flow 1: New User Onboarding (Landing to First Dashboard)
* **Description**: The entry point where anonymous prospects convert into registered, role-specific participants (Artisans/Workers or Employers).
* **Target User**: Both (Workers and Employers)
* **Step-by-step Happy Path**:
  1. **Landing Page View**: The user lands on a beautiful landing page with smooth fade-in animations on the hero sections.
     * *UI State*: An elegant call-to-action button "Get Started" scales up with a micro-bounce effect.
     * *Animation Suggestion*: Staggered entry animations (`motion.div` with `staggerChildren`) for headers and location previews.
  2. **Sign In / Sign Up Screen**: User clicks "Get Started" and is guided to the authentication screen with tabs for Email/Password and OAuth.
     * *UI State*: Active tab underlines dynamically slide across the x-axis.
     * *Animation Suggestion*: Layout-id transitions for the sliding tab indicator.
  3. **Role Selection (Onboarding)**: Upon authentication, if no profile exists, they are routed to `/onboarding`.
     * *UI State*: Two premium, large card-selectors ("Hire an Artisan" vs. "Find Local Jobs").
     * *Animation Suggestion*: Selecting a card triggers a border-glow ring animation and a subtle floating hover effect.
  4. **Initial Setup**: User completes name, location (State + LGA), and submits.
     * *UI State*: Form transitions using a multi-step slide-out animation.
  5. **Dashboard Transition**: User is dynamically redirected. Workers go to `/dashboard/passport-setup` (to verify their skills) or the job feed, and Employers go directly to the `/dashboard` to post a job.
* **Error Cases & Recovery**:
  * *Error: ERR_TOO_MANY_REDIRECTS*: Caught and completely resolved by moving database-driven profile verification from edge middleware to client-side react router hooks inside `/app/dashboard/page.tsx`.
  * *Error: Database Lock/Fail*: If database insertion fails during role-selection, a clean, readable alert toast is shown with a "Try Again" action, recovering from any transient network glitch.
* **Success Criteria**: A new profile row is created in the database, initial wallet balance is initialized (to 5 free bids for workers), passport state is created, and the user lands on their role-appropriate dashboard cleanly.
* **UI/UX Requirements**: 
  * Premium SVG vector icons for roles.
  * Haptic feedback simulator (subtle button tap states).
  * Auto-geolocation matching in Nigeria using the responsive `LocationSelector` with LGA cascades.

---

### Flow 2: Worker Job Discovery and Applying
* **Description**: Verified workers browse hyper-local jobs matching their location (State/LGA) and apply using their active bid bundles.
* **Target User**: Worker (Artisan)
* **Step-by-step Happy Path**:
  1. **Job Feed Navigation**: Worker opens `/dashboard/jobs`.
     * *UI State*: Beautiful vertical feed of available local jobs, showing State, LGA, Budget, and Urgent Badges.
     * *Animation Suggestion*: Jobs load in with a staggered vertical fade-up cascade.
  2. **Location Filtering**: Worker filters jobs by their active State and LGA.
     * *UI State*: A dropdown with immediate, client-side filtering.
  3. **Job Detail Modal/Expansion**: Clicking a job expands the details gracefully in-place or slides in a sheet from the bottom.
     * *UI State*: Detailed scope, payment structures, and urgent flags become visible.
     * *Animation Suggestion*: `SmoothCollapse` handles height transitions effortlessly.
  4. **Place a Bid**: Worker enters their bid amount, pitch, and clicks "Apply Now".
     * *UI State*: Bid button shows a loading spinner (`Loader2`) and disables to prevent double-submitting.
* **Error Cases & Recovery**:
  * *Error: Insufficient Bids*: If a worker has 0 bids remaining, the "Apply" button is greyed out with a helper badge: "0 Bids Left - Top Up Wallet". Clicking it opens the Buy Bids sheet with Paystack integration.
  * *Error: Job Already Closed*: Shows a clean inactive status, disabling further bids.
* **Success Criteria**: A row is successfully inserted in the `bids` table, 1 bid is deducted from the worker's wallet balance, and the job's employer is alerted.
* **UI/UX Requirements**: 
  * Vibrant badge accents (e.g. crimson pulsating dot for Urgent/Fire-sale jobs).
  * Crisp typography utilizing "Space Grotesk" headings and "JetBrains Mono" metadata labels.

---

### Flow 3: Employer Job Posting and Payment
* **Description**: Employers describe local repair, construction, or technical tasks and optionally pay for an "Urgent Telegram Blast" to find workers within minutes.
* **Target User**: Employer
* **Step-by-step Happy Path**:
  1. **Post-Job Screen**: Employer navigates to `/dashboard/post-job`.
     * *UI State*: A progressive, clean form asking for Title, Description, Budget, State, LGA, and Urgent toggling.
  2. **Smart Category Suggestion**: As the employer types, autocomplete suggestions appear to select the craft (e.g. Plumber, Electrician).
     * *UI State*: Instant list below the text input.
  3. **Urgent Blast Choice**: Toggling "Urgent Broadcast" expands a premium section showing a ₦1,000 upgrade fee.
     * *UI State*: Glowing crimson card with a "Telegram Blast" badge.
  4. **Pay and Publish**: The employer hits "Publish Job". If urgent, a Paystack overlay initiates. If normal, it immediately publishes.
     * *UI State*: Standard safe loading overlays with progress trackers.
* **Error Cases & Recovery**:
  * *Error: Paystack Window Closed*: If the payment dialog is dismissed, the job is saved as a draft or a clean retry button is rendered to let them resume payment without re-keying the details.
* **Success Criteria**: The job entry is written to `jobs`, an escrow record is initialized, and an automated Telegram alert is instantly dispatched to local artisan channels.
* **UI/UX Requirements**:
  * Interactive sliders for budgets.
  * Tactile checkout triggers with immediate verification spinners.

---

### Flow 4: Chat Initiation and Conversation & Inspection Fee Unlock
* **Description**: The premium core. A chat workspace allowing secure, in-app messaging, with employer-funded details release.
* **Target User**: Both (Worker and Employer)
* **Step-by-step Happy Path**:
  1. **Chat Screen Open**: A worker bid is accepted, opening a direct chat channel.
     * *UI State*: An immersive, full-screen mobile chat window with a clean layout.
  2. **Hidden Contact Guard**: By default, explicit contact numbers are masked with a warning banner at the top of the chat.
     * *UI State*: "Chat safely. Contact details are hidden until the employer pays the inspection fee."
  3. **Pay Inspection Fee**: The employer clicks "Unlock Contact Details" and pays ₦500 via an integrated Paystack button.
     * *UI State*: Loading indicator on the Paystack handler.
  4. **Instataneous Unlock**: The webhook clears, state updates, and the layout reveals the phone number and opens the real-time chat pipeline.
     * *UI State*: The masked details transform with an elegant fade-out-to-fade-in animation.
* **Error Cases & Recovery**:
  * *Error: Missing Webhook Call*: A client-side "Check Status" fallback pulls the latest payment status directly if the webhook experiences delay.
* **Success Criteria**: `is_inspection_paid` set to true in the database, allowing both parties to view verified phone numbers.
* **UI/UX Requirements**:
  * Clean, rounded message bubbles.
  * Real-time indicators with animated text entries (typing indicators).

---

### Flow 5: BukiePassport Verification
* **Description**: Workers verify their identity, qualifications, and past completed projects to earn a "Blue Check" badge and gain priority visibility.
* **Target User**: Worker (Artisan)
* **Step-by-step Happy Path**:
  1. **Passport Dashboard**: Worker navigates to `/dashboard/passport`.
     * *UI State*: Visual breakdown of verification levels (Level 1: NIN/ID, Level 2: Guild Endorsement, Level 3: Bank Verification).
  2. **Document Upload**: Worker drags and drops or taps to upload a photo of their ID.
     * *UI State*: Interactive drop zone with beautiful hover states and upload progress bar.
  3. **Selfie Verification**: Verification step with active webcam overlay for instant bio-matching.
     * *UI State*: Circular video mask guiding the user to "Position your face in the circle".
  4. **Submit for Approval**: Progress is updated instantly.
* **Error Cases & Recovery**:
  * *Error: Camera Denied*: App detects permission failure and gracefully renders an alternative file-upload field for verification.
* **Success Criteria**: Record added to `bukie_passports` with status `pending`, changing to `verified` upon approval, which triggers the automated blue check badge across their profiles.
* **UI/UX Requirements**:
  * Dynamic webcam feedback within Next.js App Router frame.
  * Premium metallic or holographic passport mockups on screen.

---

### Flow 6: Wallet and Escrow Management
* **Description**: Users view their funding history, deposit project milestones into secure escrow, or purchase bid bundles.
* **Target User**: Both
* **Step-by-step Happy Path**:
  1. **Wallet View**: User loads `/dashboard/wallet`.
     * *UI State*: A sleek, high-contrast digital card showing balance in Naira, remaining bids, and recent transaction history.
  2. **Milestone Escrow Locking**: When starting a job, the employer funds the total amount.
     * *UI State*: Escrow funds show as "Locked" inside a dedicated card.
  3. **Transaction Feed**: Scrollable historic timeline.
     * *UI State*: Clean monospaced table detailing amount, transaction code, date, and reference.
* **Error Cases & Recovery**:
  * *Error: Insufficient Balances*: Renders immediate action buttons to "Deposit Funds" directly through Paystack.
* **Success Criteria**: Ledger records are immutable, balances update in real-time, and fund lock statuses are transparent.
* **UI/UX Requirements**:
  * Dynamic cash-register sound feedback (optional, visual representation with animating balance counters).
  * Shimmering card gradient for premium gold/emerald wallets.

---

### Flow 7: Post-Job Review and Completion
* **Description**: Once the artisan finishes the task, they request release of funds. The employer confirms completion and leaves a rating and review.
* **Target User**: Both
* **Step-by-step Happy Path**:
  1. **Request Completion**: Worker taps "Mark Job as Complete" in the chat or project view.
     * *UI State*: Dialog prompts the worker to submit photos of the completed work.
  2. **Employer Approval Dialog**: The employer receives a push notification and is prompted to approve the work.
     * *UI State*: A modal with two choices: "Release Funds" or "Raise Dispute".
  3. **Review Artisan**: After releasing funds, a rating card automatically slides up.
     * *UI State*: Interactive 5-star rater where stars light up golden-yellow on hover.
  4. **Leave Feedback**: Employer leaves text feedback and clicks submit.
* **Error Cases & Recovery**:
  * *Error: Unresolvable Disagreements*: Clicking "Raise Dispute" halts the payment release and immediately launches the **Dispute Resolution Flow**, creating a ticket for moderators.
* **Success Criteria**: Escrow funds are transferred from `locked` to `released`, worker wallet balance increases, and review statistics recalculate instantly.
* **UI/UX Requirements**:
  * Elegant rating animations (star hover scaling).
  * Celebration confetti animation upon successful fund release and positive review.

---

### Flow 8: Admin Moderation (Basic)
* **Description**: System admins review disputed escrow claims, verify BukiePassport requests, and moderate system safety.
* **Target User**: Support/Admin Staff
* **Step-by-step Happy Path**:
  1. **Dispute Queue**: Admin loads the `/dashboard/disputes` page.
     * *UI State*: Responsive cards showing the dispute reason, original contract details, and communication history.
  2. **Evidence Auditing**: Admin opens the dispute case and views original text logs and uploaded evidence.
  3. **Resolve Verdict**: Admin clicks either "Refund Employer" or "Payout Worker".
     * *UI State*: Confirmation modal highlighting the distribution of escrow.
  4. **Immutable Ledger Entry**: State resolves and is finalized.
* **Error Cases & Recovery**:
  * *Error: Multi-strike Artisan*: The system increments strike tallies automatically, and freezes the worker's passport if they reach 3 strikes, logging the action for audit.
* **Success Criteria**: Dispute state is set to `resolved`, wallet funds are dispersed securely according to the admin verdict, and path cache revalidates.
* **UI/UX Requirements**:
  * Command-center style minimal visual layout.
  * Clear status indicators (e.g. Amber for disputed, Green for resolved, Gray for archived).
