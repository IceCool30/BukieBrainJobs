# Spec: BW-001 BrainWorker Platform Onboarding & Identity Verification UX Design Specification (v1.0)

| Field | Value |
|---|---|
| **Document ID** | BW-001-UX |
| **Feature** | BrainWorker Onboarding & Identity Verification |
| **Status** | 🟡 Proposed for UX Approval (v1.0) |
| **Version** | 1.0 |
| **Workstream** | Phase 2: BrainWorker (Service Provider) Web Platform |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Scope Contract** | BW-001 Scope Specification v1.0 (`docs/specs/BW-001-onboarding.md`) |
| **Architecture Contract** | BW-001 Architecture Contract v1.0 (`docs/specs/BW-001-architecture-contract.md`) |
| **Target Surfaces** | `/brainworker/register`, `/brainworker/onboarding`, `/brainworker/verification-status` |
| **Design Standards** | BukieBrainJobs Experience Standards & Content Style Guide |
| **Date** | 2026-09-24 |

---

## 1. Executive Summary & Core Experience Principles

BW-001 establishes the provider onboarding and identity verification user experience for BukieBrainJobs. It bridges trade professionals, artisans, and technicians across Nigeria from initial account creation through identity data capture, trade specialty setup, credential evidence upload, and operational review monitoring.

### Core Experience Principles

1. **Trade Dignity & Professional Respect**:
   The intake experience treats Nigerian artisans and technicians as licensed service professionals, not gig workers. The visual tone is structured, serious, and aspirational.
2. **Clear Progress & Zero Guesswork**:
   A 4-step progressive funnel displays an honest completion tracker. Every step saves progress continuously so applicants never lose inputted data on network interruptions.
3. **Format Validation Without False Verification Claims**:
   Input validation confirms syntactic completeness (11 digits for NIN/BVN) with quiet, state-honest messaging (`"11-digit format valid"`). The UI never falsely labels unreviewed data as "Verified".
4. **Transparent Identity Masking**:
   National identity numbers are masked immediately after entry (`•••••••1234`), protecting sensitive identity credentials while allowing quick verification of the last 4 digits.
5. **Deterministic Status Communication**:
   The verification monitor (`/brainworker/verification-status`) provides clear, unambiguous visual states for queue placement, active review, targeted remediation, rejection, and final approval.

---

## 2. Visual System & Brand Tokens

The onboarding surfaces strictly inherit the BukieBrainJobs visual tokens:

| Token Role | Value / Class | Usage in Provider Onboarding |
|---|---|---|
| **Canvas Background** | `#F8F9FF` (`bg-[#F8F9FF]`) | Page background behind onboarding forms and status cards |
| **Card Surface** | `#FFFFFF` (`bg-white`) | Funnel step containers, document dropzones, status detail cards |
| **Primary Brand Navy** | `#001A41` (`text-[#001A41]`) | Step headings, primary CTA buttons, active stepper numbers |
| **Secondary Navy** | `#002661` (`hover:bg-[#002661]`) | Button hover state |
| **Brand Mint Accent** | `#ABEEC8` (`bg-[#ABEEC8]`) | Completed step checkmarks, progress bar fill, verified badge |
| **Supporting Green** | `#296A4B` (`text-[#296A4B]`) | Format check indicators, approval badges, success pill borders |
| **Amber Warning** | `#D97706` (`text-amber-600`) | In-review indicator, remediation required banners |
| **Crimson Danger** | `#DC2626` (`text-red-600`) | Validation errors, rejected status indicators |
| **Border Neutral** | `#E2E8F0` (`border-slate-200`) | Input borders, card outlines, table dividers |
| **Text Primary** | `#0B1C30` (`text-slate-900`) | Field labels, applicant names, section titles |
| **Text Muted** | `#64748B` (`text-slate-500`) | Helper text, document file sizes, turnaround disclaimers |

### Typography & Layout Geometry
- **Headings**: Hanken Grotesk (`font-display font-bold text-2xl sm:text-3xl text-[#001A41]`).
- **Section Headers**: Inter semibold (`font-sans font-semibold text-base text-[#001A41]`).
- **Input Labels & Body**: Inter medium (`font-sans text-xs sm:text-sm text-slate-700`).
- **Card Containers**: `rounded-2xl border border-slate-200/80 shadow-sm`.
- **Buttons & Chips**: `rounded-xl min-h-[44px]` (desktop), `min-h-[48px]` (mobile touch targets).

---

## 3. Surface Specifications

### 3.1 Provider Registration Surface: `/brainworker/register`

- **Purpose**: Specialized signup for service providers, setting `role: 'brainworker'` and `isBrainWorkerApproved: false`.
- **Header**:
  - BukieBrainJobs logo linking to `/`.
  - Right-side link: `"Already a provider? Sign In"` routing to `/login?redirect=/brainworker/onboarding`.
- **Hero & Value Card**:
  - Headline: *"Join Nigeria’s Most Trusted BrainWorker Network"*
  - Subhead: *"Receive guaranteed escrow payments, direct job requests, and grow your artisan business across Nigeria."*
  - Trust Pillars:
    - Guaranteed Escrow: Payment secured before you arrive on site.
    - Verified Customers: Real jobs from vetted homeowners and businesses.
    - Professional Growth: Verified profile badge and customer reviews.
- **Form Fields**:
  1. **Full Legal Name** (`input[type="text"]`): Plaintext entry. Helper: *"Must match your government ID exactly."*
  2. **Nigerian Mobile Number** (`input[type="tel"]`): Localized with `+234` prefix, format enforcement (`080...`, `070...`, `090...`).
  3. **Professional Email** (`input[type="email"]`): Validated email address.
  4. **Password** (`input[type="password"]`): Minimum 8 characters, visibility toggle.
  5. **Primary Trade Category** (`select`): Dropdown with the 8 canonical categories.
- **Primary CTA**: `"Create BrainWorker Account"`.
- **Customer Conflict Banner**:
  - Muted footer alert: *"Looking to hire a professional? [Register as a Customer instead](/register)"*.

---

### 3.2 Onboarding Funnel: `/brainworker/onboarding`

The onboarding workspace uses a sticky 4-step stepper bar on top and a centered form card below (`max-w-2xl mx-auto`).

#### 3.2.1 Stepper Navigation (`FunnelProgressBar`)
- **Desktop (>= 768px)**: Horizontal stepper displaying 4 steps:
  1. `1. Legal Identity`
  2. `2. Trade Profile`
  3. `3. Credentials`
  4. `4. Final Review`
  - Completed steps display a mint checkmark (`CheckCircle2`).
  - Active step displays a solid navy pill with white step number.
  - Upcoming steps display muted slate circles.
- **Mobile (< 768px)**: Compact status bar:
  - Step counter: `"Step 2 of 4: Trade Profile"`
  - Smooth progress bar filling in increments of 25% (25%, 50%, 75%, 100%).

---

#### 3.2.2 Step 1: Legal Identity (`IdentityStepForm`)
- **Header**: `"Step 1: Your Legal Identity"`
- **Subtext**: *"We verify all BrainWorkers with Nigerian identity authorities to keep our marketplace safe and trusted."*
- **Fields**:
  1. **Legal First Name**, **Middle Name** (Optional), **Surname**: Separate fields to avoid name ordering errors.
  2. **Date of Birth**:
     - Three accessible selectors: Day (1–31), Month (January–December), Year (enforces 18+ requirement).
     - Error if under 18: `"You must be at least 18 years old to operate as a BrainWorker."`
  3. **Identity Identifier Selector**:
     - Radio card toggle:
       - `[•] National Identity Number (NIN)`
       - `[ ] Bank Verification Number (BVN)`
  4. **11-Digit Identifier Input**:
     - Numeric keypad on mobile (`inputMode="numeric"`).
     - Auto-sanitized to digits only.
     - Live character count: `"11 of 11 digits"`.
     - Syntactic status indicator:
       - Incomplete (< 11 digits): `"Enter your 11-digit NIN"`
       - Exactly 11 digits: `"✓ 11-digit format valid"` in `#296A4B` green text.
     - Privacy Note: *"Your NIN/BVN is used strictly to cross-reference your legal identity. It is never displayed to customers or shared with third parties."*
     - Blur behavior: Transitions to masked view (`•••••••1234`) with a `"Show / Edit"` toggle.
  5. **Residential Address**:
     - Street Address (`input[type="text"]`)
     - State (`select` of Nigerian states)
     - LGA / City (`input[type="text"]`)
- **Action Footer**:
  - Primary Button: `"Save & Continue to Trade Profile"` (disabled until all required fields are valid).

---

#### 3.2.3 Step 2: Trade & Coverage Profile (`TradeStepForm`)
- **Header**: `"Step 2: Trade & Coverage Profile"`
- **Subtext**: *"Configure your primary trade specialty and the Nigerian cities where you accept jobs."*
- **Fields**:
  1. **Primary Trade Category**:
     - 8 interactive selection cards with icons:
       - Generator Repair & Maintenance
       - Air Conditioning & Refrigeration
       - Plumbing & Pipe Fitting
       - Electrical Installation & Inverters
       - Carpentry & Furniture Making
       - Painting & Wall Finishing
       - Masonry, Tiling & Bricklaying
       - Welding & Metal Fabrication
     - Selected card displays navy border (`border-[#001A41]`), subtle mint ring, and checked radio circle.
  2. **Sub-Specialties (Tags)**:
     - Tag chip input with suggestions (e.g. *Diesel Generators*, *Changeover Switches*, *Soundproof Enclosures*).
     - Allows up to 5 custom tags with single-click remove (`X`).
  3. **Experience Tier**:
     - 3 tiered selector cards:
       - `Apprentice / Intermediate` (1–3 years practical experience)
       - `Journeyman / Experienced` (4–7 years field experience)
       - `Master Craftsman` (8+ years leading projects and apprentices)
  4. **Years in Trade**:
     - Positive integer input (1 to 50).
  5. **Active Coverage Cities**:
     - Multi-select interactive pills for the 7 canonical Nigerian cities:
       - `[✓] Lagos`
       - `[✓] Abuja (FCT)`
       - `[ ] Port Harcourt`
       - `[ ] Ibadan`
       - `[ ] Benin City`
       - `[ ] Enugu`
       - `[ ] Kano`
     - Quick `"Select All"` / `"Clear"` utility buttons. Minimum 1 city required.
- **Action Footer**:
  - Secondary Button: `"Back to Identity"`
  - Primary Button: `"Save & Continue to Credentials"`

---

#### 3.2.4 Step 3: Credentials & Evidence Staging (`CredentialsStepForm`)
- **Header**: `"Step 3: Documents & Credentials"`
- **Subtext**: *"Upload your government identification and trade certifications. Photos must be clear and readable."*
- **Sections**:
  1. **Government Identity Document (Mandatory)**:
     - Specific Document Dropdown:
       - `National e-ID Card / NIN Slip (NIMC)`
       - `Driver's License (FRSC)`
       - `Permanent Voter's Card (INEC)`
       - `International Passport (NIS)`
     - Upload Dropzone (`DocumentUploadCard`):
       - Drag & drop or click file picker (`input[type="file"]`, `accept="image/jpeg,image/png,image/webp,application/pdf"`).
       - Max file size notice: `"JPG, PNG, WEBP, or PDF up to 5 MB"`.
       - Staged state:
         - Image: Aspect-ratio constrained preview thumbnail (`max-h-40 object-cover rounded-xl`).
         - PDF: Accessible PDF icon card with file name, formatted size (`e.g. 1.8 MB`), and `"PDF Document"` badge.
         - Action buttons: `"Replace"` and `"Remove"`.
  2. **Trade Competency Proof (Mandatory - At least 1)**:
     - Specific Credential Dropdown:
       - `Trade Test Certificate (Ministry of Labour)`
       - `Apprenticeship Freedom Letter / Certificate`
       - `Vocational Diploma (NABTEB, City & Guilds)`
       - `Artisan Association Membership ID`
     - Upload dropzone matching the staging pattern above.
     - Multi-file list: Ability to stage multiple trade certificates.
  3. **Workshop & Equipment Proof (Optional)**:
     - Specific Work Proof Dropdown:
       - `Workshop Physical Photo with Signboard`
       - `Tool Kit / Diagnostic Gear Photo`
       - `Past Completed Work Photo`
     - Upload dropzone for optional workshop/equipment verification.
- **Action Footer**:
  - Secondary Button: `"Back to Trade Profile"`
  - Primary Button: `"Save & Continue to Review"` (disabled until 1 Government ID and at least 1 Trade Proof are staged).

---

#### 3.2.5 Step 4: Final Review & Submission (`ReviewStepForm`)
- **Header**: `"Step 4: Review & Submit Application"`
- **Subtext**: *"Confirm your details before submitting for operational review. Once submitted, your application is locked."*
- **Summary Cards**:
  1. **Identity Summary Card**:
     - Full legal name, date of birth, masked identifier (`NIN: •••••••1234`), address.
     - `"Edit"` button linking back to Step 1.
  2. **Trade & Coverage Summary Card**:
     - Primary trade category with icon, experience tier, years, sub-specialty chips, coverage cities.
     - `"Edit"` button linking back to Step 2.
  3. **Documents & Credentials Summary Card**:
     - List of all staged documents with category badges and thumbnail previews.
     - `"Edit"` button linking back to Step 3.
- **Legal Truthfulness Declaration**:
  - Distinct bordered box with alert shield icon:
    - Checkbox 1: `[ ] I solemnly declare that all personal details, trade credentials, and documents provided are genuine, valid, and belong to me. I understand that submitting forged credentials results in immediate disqualification and legal escalation.`
    - Checkbox 2: `[ ] I agree to the BukieBrainJobs Provider Terms of Service, Code of Conduct, and Operational Safety Rules.`
- **Action Footer**:
  - Secondary Button: `"Back to Credentials"`
  - Primary Button: `"Submit Verification Application"`
    - Disabled until both checkboxes are ticked.
    - Shows loading spinner (`"Submitting application..."`) during mutation.
    - On success: Routes immediately to `/brainworker/verification-status`.

---

### 3.3 Verification Status Monitor: `/brainworker/verification-status`

Dedicated dashboard status screen providing unambiguous operational feedback.

#### 1. `SUBMITTED` State (Queue Placement)
- **Banner**: Blue badge (`"Application Received"`).
- **Heading**: *"Your Verification Application is in Queue"*
- **Message**: *"We have received your identity and trade credentials. Your application is queued for operational review by our verification team."*
- **Turnaround Box**:
  - Clock icon: *"Expected turnaround: 24 to 48 business hours."*
  - Explanatory note: *"You will receive an in-app alert and SMS as soon as your background review is complete."*
- **Summary Preview**: Collapsible read-only view of submitted details.

#### 2. `PENDING_REVIEW` State (Active In-Progress Review)
- **Banner**: Amber badge with pulsing indicator (`"Under Active Review"`).
- **Heading**: *"Verification Review in Progress"*
- **Timeline Checklist**:
  - `[✓] Application Submitted & Formats Checked` (Completed)
  - `[⟳] Government Identity Document Review` (In Progress)
  - `[○] Trade Credential & Competency Check` (Pending)
  - `[○] Final Operating Approval` (Pending)
- **State Honesty**: Clearly states review is ongoing without making premature completion guarantees.

#### 3. `REMEDIATION_REQUIRED` State (Actionable Issue Flagged)
- **Banner**: High-visibility amber/crimson alert card.
- **Heading**: *"Action Needed: Document Re-Upload Required"*
- **Issue Details Box**:
  - Icon: Warning triangle (`AlertTriangle`).
  - Flagged Step: e.g. `Government Identity Document`.
  - Reviewer Guidance: e.g. *"The photo of your National e-ID Card was blurry and the NIN number was not readable. Please upload a clear, high-resolution photo."*
- **Primary CTA**: `"Update Government ID"`
  - Routes directly to `/brainworker/onboarding?step=credentials`, unlocking *only* the flagged document dropzone while preserving all other valid entries.

#### 4. `REJECTED` State (Authoritative Disqualification)
- **Banner**: Slate/Crimson card (`"Application Not Approved"`).
- **Heading**: *"Verification Could Not Be Completed"*
- **Message**: Rendered strictly based on authoritative `rejectionReasonCode`:
  - `UNVERIFIABLE_CREDENTIALS`: *"Our verification team was unable to confirm the trade test or apprenticeship records provided with the issuing authority."*
  - `FRAUD_SUSPECTED` / `DOCUMENT_FORGERY`: *"The submitted documents could not be authenticated or contained mismatched biometric records."*
  - `INELIGIBLE_APPLICANT`: *"The application does not meet the minimum operating criteria for BukieBrainJobs providers."*
- **Support Link**: Link to contact operational customer support (`support@bukiebrainjobs.com`).

#### 5. `APPROVED` State (Operating Workspace Unlocked)
- **Banner**: Emerald celebration card with checkmark badge (`"Verified Provider"`).
- **Heading**: *"Congratulations! Your BrainWorker Account is Verified"*
- **Subtext**: *"You are now an approved service provider on BukieBrainJobs. Your profile is active and eligible to receive verified customer booking requests."*
- **Provider ID Badge**: Displaying applicant name, verified trade category, and official BrainWorker ID.
- **Primary CTA**: `"Enter BrainWorker Workspace"`
  - High-visibility primary button routing directly to `/brainworker/dashboard`.

---

## 4. Accessibility & Mobile Standards

1. **44px / 48px Touch Targets**:
   - All interactive inputs, chips, checkboxes, and buttons adhere to a minimum 44×44px bounding box on desktop and 48×48px on mobile bottom bars.
2. **Keyboard Navigation & Visible Focus**:
   - Every form input, radio card, dropzone, and button maintains visible focus rings (`focus-visible:ring-2 focus-visible:ring-[#001A41] focus-visible:ring-offset-2`).
3. **Screen Reader Live Announcements**:
   - Stepper transitions announce `aria-current="step"`.
   - File staging status and upload progress utilize `role="status"` and `aria-live="polite"`.
   - Error banners use `role="alert"`.
4. **Color Contrast & Reduced Motion**:
   - WCAG AAA compliance on all body text and form labels (`#001A41` text on `#F8F9FF` canvas).
   - `prefers-reduced-motion` suppresses progress bar sliding transitions and pulsating badges.
