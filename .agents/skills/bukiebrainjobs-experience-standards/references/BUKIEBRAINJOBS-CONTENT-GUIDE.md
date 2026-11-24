Absolutely. I incorporated the adjustments while preserving the original intent and structure. I also kept the guide focused on customer-facing content, so it does not conflict with technical, legal, or engineering documentation.

Here is the final copyable version:

# BUKIEBRAINJOBS CONTENT STYLE GUIDE

**Version:** 1.0  
**Status:** Approved Draft  
**Scope:** Customer-facing platform content  
**Source of Truth:** This document governs BukieBrainJobs customer-facing content and screen copy.

---

## 1. CORE PRINCIPLES

### 1.1 Voice and Tone

Always use:

- **Active voice:** "We protect your information."
- **Direct address:** Use "You" and "We" where appropriate.
- **Confident and clear:** State what we know without unnecessary hedging.
- **Professional and approachable:** Sound credible, useful, and human.
- **Action-oriented:** Tell users what they can do next.
- **Benefit-focused:** Explain why an action or feature matters.

Avoid:

- Passive voice where active voice is clearer.
- Third-person references such as "the user."
- Overly casual language.
- Apologetic language that weakens confidence.
- Empty marketing language.
- Claims we cannot verify or support.

### Example

Bad:

> Your profile will be reviewed after your information is submitted.

Good:

> We review your profile after you submit your information.

---

## 2. LANGUAGE AND TERMINOLOGY

Consistent terminology is mandatory across customer-facing content.

### 2.1 Approved Marketplace Terms

| Concept | Preferred Term | Avoid |
|---|---|---|
| Person hiring | Customer | Client, Employer |
| Service provider | BrainWorker | Worker, Artisan, Talent |
| Generic service provider reference | Professional | Worker, Artisan |
| Work request | Job | Gig, Task |
| Service offering | Service | Gig |
| Hiring action | Book | Hire, Engage |
| Work request submission | Post a job | Create a task |
| Provider onboarding | Become a BrainWorker | Become a worker |
| Provider identity | Profile | Passport |
| Provider verification | Verification | BukiePassport |
| Payment protection | Escrow | Transactional payment |
| Geographic availability | Location | Coordinates |
| Search result | Professional / Service | Candidate |
| Work opportunity | Job / Opportunity | Gig |

Use **BrainWorker** when referring specifically to a service provider on BukieBrainJobs.

Use **professional** when the context is generic or marketing-focused.

### 2.2 Platform Terminology

Use:

- Platform
- Service
- BukieBrainJobs
- Web app
- Mobile app

Use the term that fits the context.

For example:

> Find professionals on our platform.

> Open the mobile app to manage your jobs.

Do not force "platform" into technical or product contexts where "app" or "web app" is more precise.

### 2.3 Internal Product Terms

Do not expose internal, deprecated, or implementation-specific terminology in customer-facing content.

For example:

Bad:

> Complete your BukiePassport.

Good:

> Complete your profile verification.

Bad:

> Our advanced protocol facilitates professional matching.

Good:

> We match you with relevant professionals.

---

## 3. CUSTOMER-FACING BRAND LANGUAGE

Use **BukieBrainJobs** when the brand name improves clarity or recognition.

Do not interpret the rule against internal brand terminology as a ban on the BukieBrainJobs name.

Use:

> Join BukieBrainJobs.

> Find professionals on BukieBrainJobs.

Avoid exposing internal product names, experimental terminology, architectural concepts, or deprecated branding.

### Brand terminology rule

Customer-facing terminology must come from the approved product vocabulary.

Internal names must not become customer-facing terms unless we explicitly approve them.

---

## 4. SENTENCE STRUCTURE

Prefer:

- Short sentences.
- One primary idea per sentence.
- Clear subject and action.
- Simple vocabulary.
- Direct instructions.

### Sentence length

Aim for **10 to 20 words per sentence**.

Shorter is better when it improves clarity.

Longer sentences are acceptable when shortening them would reduce meaning or precision.

### Avoid

- Long introductory clauses.
- Multiple nested ideas.
- Unnecessary qualifiers.
- Dense technical language.
- Repeated explanations.

Bad:

> In order to facilitate the optimal matching of your professional profile with relevant opportunities in your geographic area, we utilize advanced algorithms.

Good:

> We match your profile with relevant opportunities in your area.

---

## 5. FORMATTING STANDARDS

### 5.1 Headings

Use a clear hierarchy:

- **H1:** Page title.
- **H2:** Major sections.
- **H3:** Subsections.

Keep headings concise.

Prefer:

> How It Works

Avoid:

> Important Information About How Our Service Works

### 5.2 Lists

Use bullets for three or more related items.

Keep list items parallel.

Example:

```tsx
<ul className="list-disc pl-5 space-y-2">
  <li><strong>Account Information:</strong> Your name, email, and phone number.</li>
  <li><strong>Location:</strong> Your state and local area.</li>
  <li><strong>Skills:</strong> Your professional credentials.</li>
</ul>

5.3 Cards and Content Sections

Follow the approved Design System.

Do not introduce customer-facing visual rules that conflict with DESIGN.md or the approved Design System.


---

6. CTA AND ACTION LANGUAGE

Use clear action verbs.

Preferred

Search for a Service

Post a Job

Find Professionals

View Profile

Book Now

Get Started

Become a BrainWorker

Continue

Submit

Save Changes

Verify Profile


Avoid

Click Here

Learn More Here

Submit Now

Proceed

Take Action

Get Started With Our Amazing Platform


CTA text should tell the user what will happen next.


---

7. UI MICROCOPY

Customer-facing microcopy must be clear, specific, and useful.

This includes:

Buttons

Labels

Placeholders

Validation messages

Error messages

Empty states

Loading states

Confirmation messages

Notifications

Search prompts

Onboarding instructions

Verification states


7.1 Form Labels

Use explicit labels.

Bad:

> Details



Good:

> Phone Number



Bad:

> Location



Good:

> State



7.2 Placeholders

Use placeholders to provide examples or guidance.

Bad:

> Enter here



Good:

> Enter your phone number



Do not use placeholders as the only label for important fields.

7.3 Empty States

Explain what happened and what the user can do next.

Bad:

> No results found.



Good:

> No professionals found in this area.



> Try another location or post a job to get matched.



7.4 Loading States

Describe the current action when useful.

Examples:

> Finding professionals near you...



> Loading your jobs...



> Processing your payment...



7.5 Success Messages

State the completed action clearly.

Bad:

> You're all set!



Good:

> Your job has been posted successfully.



7.6 Error Messages

Explain the problem and provide a next step.

Bad:

> Something went wrong.



Good:

> Unable to process your payment. Please try again.



If the system can provide a specific recovery action, include it.


---

8. TRUST AND SAFETY LANGUAGE

Trust claims must describe actual platform behavior.

Never make unsupported claims.

Avoid:

100% safe

Completely risk-free

Guaranteed professional

Fully trusted

Guaranteed results

Always available

Background checked, unless the required check was completed

Verified, unless the required verification was completed


Prefer precise statements.

Example:

> This professional has completed profile verification.



Instead of:

> This professional is completely trusted.



Verification language

Only describe a verification status that the platform actually records.

Do not imply that profile verification guarantees service quality, safety, or outcomes.

Payment language

Describe the actual payment process.

Prefer:

> Pay through our escrow system.



Avoid:

> Your money is completely protected.



unless the specific protection is actually provided and documented.


---

9. MARKETPLACE ENTRY LANGUAGE

BukieBrainJobs supports three primary marketplace paths.

Customers

1. Find and book a BrainWorker


2. Post a job and get matched



BrainWorkers

3. Become a BrainWorker



Customer-facing content should make these paths understandable without creating unnecessary complexity.

Preferred examples

> Find a professional for your job.



> Post a job and get matched with professionals.



> Become a BrainWorker and receive relevant job opportunities.




---

10. LOCATION LANGUAGE

Use location terms when they improve clarity.

Prefer:

Location

State

City

Area

Near you

Available in your area


Avoid unnecessary geographic complexity.

Geographic specificity

Do not hide real location information when it helps users understand marketplace availability.

For example:

> Available in Abuja.



is appropriate when Abuja is the relevant market.

Avoid unnecessary references to administrative structures when users do not need them.

Marketplace availability

When a market has not activated, use clear availability language.

Example:

> We're coming soon to your area.



> Get notified when professionals become available.



Do not imply nationwide service availability where a market is not yet active.


---

11. LOCALIZATION

Customer-facing content should use language that works across supported markets.

Use:

State

City

Location

Local area

Currency


Use specific countries, states, cities, or currencies when they provide necessary context.

Currency

Use the actual currency displayed by the product.

For example:

> ₦25,000



Do not replace a real currency with a generic term when the actual currency is required for clarity.

Geographic references

Avoid unnecessary location-specific marketing claims.

Bad:

> Find the best plumber in Lagos, Nigeria.



Better:

> Find verified professionals near you.



Specific locations remain appropriate when the product experience requires them.


---

12. GRAMMAR AND MECHANICS

Use

Active voice.

Present tense.

Direct instructions.

Contractions where natural.

Oxford commas.

"And" instead of "&" in normal copy.


Avoid

Excessive exclamation marks.

ALL CAPS in normal content.

Unnecessary abbreviations.

Slang.

Artificially complex vocabulary.

Decorative punctuation.


Contractions

Use natural contractions:

We're

You'll

Don't

Can't

It's


Avoid contractions in highly formal legal or contractual text when precision requires a more formal style.


---

13. EMOJIS

Do not use emojis in normal BukieBrainJobs platform content.

Emojis may only appear when explicitly approved for a specific marketing campaign or communication channel.

They should never replace important text, labels, instructions, or status information.


---

14. TECHNICAL LANGUAGE

Customer-facing content must use plain language.

If a technical concept affects the customer, explain what it means rather than exposing implementation terminology.

Bad:

> Authentication failed due to an invalid JWT.



Good:

> Your session has expired. Please sign in again.



Bad:

> The API returned a 429 response.



Good:

> Too many requests. Please wait a moment and try again.



Technical documentation may use the correct engineering terminology.

This guide governs customer-facing content, not source code or architecture documentation.


---

15. LEGAL AND REGULATORY CONTENT

Legal content may require terminology that differs from normal product copy.

Legal documents should prioritize:

1. Accuracy


2. Legal precision


3. Clarity


4. Consistency



Do not simplify legal language if doing so changes its legal meaning.

Specific legal requirements may reference:

Nigeria

State authorities

Applicable regulations

Currency

Legal entities

Regulatory terminology


These references are permitted when required.


---

16. ACCESSIBILITY

All customer-facing content must support accessible use.

Requirements

Use descriptive link text.

Maintain logical heading hierarchy.

Do not use color alone to convey meaning.

Provide meaningful labels.

Use clear error messages.

Avoid ambiguous instructions.

Maintain readable text.

Support keyboard navigation where applicable.

Maintain the approved contrast requirements.

Do not rely on icons without accessible labels when the icon carries meaning.


Bad:

> Click here.



Good:

> View your profile.



Bad:

> The red field is incorrect.



Good:

> Enter a valid phone number.




---

17. CONTENT FORMS

17.1 Hero Sections

Structure:

[Main Headline]
[Benefit-focused Subheadline]
[Primary CTA]
[Secondary CTA, when required]

Headline

Aim for:

One clear idea.

Six to eight words where practical.

A customer benefit.


Example:

> Find Verified Professionals Near You



Subheadline

Explain the immediate value.

Example:

> Search services or post a job to get matched.



CTA

Use an action verb.

Example:

> Search for a Service




---

18. FEATURE CARDS

Structure:

[Icon]
[Title]
[Description]
[CTA, when required]

Title

Aim for two to four words.

Description

Use one clear sentence.

Example:

For Customers

Find a Professional

Search services and book verified BrainWorkers near you.


---

19. ERROR, SUCCESS, AND STATUS LANGUAGE

Error

State:

1. What happened.


2. What the user should do next.



Example:

> We couldn't process your payment.



> Check your payment details and try again.



Success

State the completed action.

Example:

> Your profile has been updated successfully.



Warning

Explain the consequence.

Example:

> Your profile is incomplete.



> Complete verification to access this feature.



Informational

Explain what the user needs to know.

Example:

> This market is not active yet.



> Get notified when services become available.




---

20. CONTENT HIERARCHY

Every screen should make the next action obvious.

Use this hierarchy where appropriate:

Page purpose
    ↓
Primary benefit
    ↓
Supporting information
    ↓
Primary action
    ↓
Secondary action
    ↓
Additional information

Do not give every message equal visual or verbal weight.


---

21. CONTENT CONSISTENCY

Use the same term for the same concept across the product.

For example:

Use:

> Post a Job



Do not alternate between:

Post a Job

Create a Job

Submit a Task

Create a Gig

Request Work


Unless the underlying action is genuinely different.

Likewise:

Use:

> Profile Verification



Do not alternate between:

Identity Check

Profile Review

Verification Process

BukiePassport


unless the product defines those as separate concepts.


---

22. BRAND VOICE EXAMPLES

Scenario	Avoid	Preferred

CTA	Click Here	Post a Job
Error	Something went wrong	Unable to process payment. Please try again.
Success	You're all set!	Your job has been posted successfully.
Section header	Important Information	How It Works
Description	Our platform utilizes advanced matching algorithms	We match you with relevant professionals.
Empty state	No results found	No professionals found in this area.
Verification	Complete your BukiePassport	Complete your profile verification.
Location	Browse every professional nationwide	Find professionals in your area.
Payment	Your transaction is completely protected	Pay through our escrow system.



---

23. CONTENT SOURCE HIERARCHY

Customer-facing content follows this authority order:

Product Foundation
        ↓
Approved Product Specifications
        ↓
BUKIEBRAINJOBS CONTENT STYLE GUIDE
        ↓
Screen-specific Content
        ↓
UI Copy

The Content Style Guide governs language and customer-facing terminology.

It does not override:

Product requirements

Legal requirements

Security requirements

Technical specifications

Database terminology

API terminology

Code identifiers

Architecture documentation

Approved Design System rules


When two approved sources conflict, resolve the conflict explicitly.

Do not silently choose one.


---

24. DESIGN SYSTEM RELATIONSHIP

The Content Style Guide and Design System serve different purposes.

Design System

Controls:

Visual identity

Colors

Typography

Layout

Spacing

Components

Iconography

Motion

Accessibility

Design tokens


Content Style Guide

Controls:

Voice

Tone

Terminology

Sentence structure

CTA language

UI microcopy

Trust language

Localization language

Content accessibility


Both systems must work together.

Do not introduce content rules that conflict with the approved visual system.


---

25. DEVELOPER GUIDELINES

Developers must not introduce arbitrary customer-facing terminology.

Before adding new UI copy:

Check this guide.

Check the relevant product specification.

Reuse approved terminology.

Keep copy close to the action it describes.

Avoid hardcoded terminology when the product requires localization.

Use design tokens for visual styling.

Keep content separate from implementation logic where the architecture supports it.


Do not

Invent new names for existing concepts.

Reintroduce deprecated terminology.

Expose internal system terminology.

Hardcode unsupported claims.

Create inconsistent CTA labels.



---

26. AGENT GUIDELINES

AI agents and content agents must review customer-facing content against this guide before delivery.

Agents must:

Use approved terminology.

Prefer active voice.

Keep sentences clear.

Avoid unsupported claims.

Check marketplace terminology.

Check accessibility.

Check location language.

Check trust and verification claims.

Flag unresolved terminology conflicts.

Preserve approved product terminology.


Agents must not silently invent missing product requirements.

If the required terminology is unclear, flag the ambiguity.


---

27. CONTENT REVIEW CHECKLIST

Before publishing customer-facing content, verify:

Voice

[ ] Active voice is used where practical.

[ ] Direct address is used appropriately.

[ ] Tone is professional and approachable.

[ ] Copy is confident and clear.

[ ] Language is benefit-focused.


Terminology

[ ] "Customer" is used for people hiring professionals.

[ ] "BrainWorker" is used for service providers.

[ ] "Professional" is used where generic provider language is appropriate.

[ ] "Job" is used for work requests.

[ ] "Service" is used for service offerings.

[ ] "Profile" is used instead of deprecated identity terms.

[ ] "Verification" is used for approved verification concepts.

[ ] "Escrow" is used for the approved payment protection model.

[ ] Deprecated or internal terminology is excluded.


Structure

[ ] Sentences are concise.

[ ] Each sentence has a clear purpose.

[ ] Lists use bullets when appropriate.

[ ] Headings follow the approved hierarchy.

[ ] CTAs use clear action verbs.


Trust

[ ] No unsupported claims are made.

[ ] Verification claims reflect actual status.

[ ] Payment claims reflect actual platform behavior.

[ ] Safety claims are accurate and specific.


Localization

[ ] Location references are necessary and accurate.

[ ] Market availability is represented correctly.

[ ] Currency is displayed correctly.

[ ] Geographic limitations are not hidden.


Accessibility

[ ] Link text is descriptive.

[ ] Instructions are clear.

[ ] Errors explain what happened and what to do.

[ ] Content does not rely on color alone.

[ ] Labels are meaningful.

[ ] Heading hierarchy is logical.


Consistency

[ ] Existing approved terminology is reused.

[ ] No duplicate names exist for the same action.

[ ] Product specifications have been checked.

[ ] Screen-specific copy follows this guide.



---

28. INDUSTRY BENCHMARK

BukieBrainJobs should match or exceed the clarity standards expected from established digital marketplaces.

Platform	Tone	Sentence Length	Terminology	Structure

LinkedIn	Professional, direct	Short	Plain	Clear sections
Upwork	Confident, action-oriented	Short	Simple	Task-focused
Fiverr	Friendly, benefit-focused	Short	Clear	Cards and lists
BukieBrainJobs	Professional, direct, benefit-focused	Short	Plain	Clear and action-oriented


Target

Write copy that is:

Clear enough to understand quickly.
Specific enough to build trust.
Useful enough to guide action.


---

29. QUICK REFERENCE

For Marketing

Use active voice.

Speak directly to customers.

Keep copy concise.

Focus on benefits.

Use approved marketplace terminology.

Avoid unsupported claims.

Use real locations when relevant.

Keep CTAs action-oriented.


For Designers

Follow approved content hierarchy.

Use clear labels.

Give primary actions clear emphasis.

Preserve readable text lengths.

Support accessible content.

Do not introduce terminology through visual components.


For Developers

Check approved terminology before writing UI copy.

Reuse existing labels and actions.

Avoid hardcoded unsupported claims.

Keep content consistent across screens.

Follow the approved Design System for presentation.


For Agents

Review every customer-facing response against this guide.

Flag terminology conflicts.

Do not invent missing requirements.

Verify trust and verification claims.

Check accessibility requirements.

Preserve approved product language.



---

30. GOVERNANCE

This document is the single source of truth for BukieBrainJobs customer-facing content.

File name:

BUKIEBRAINJOBS-CONTENT-GUIDE.md

Recommended repository location:

docs/02-design-system/BUKIEBRAINJOBS-CONTENT-GUIDE.md

This guide should be reviewed whenever:

The product terminology changes.

A new marketplace workflow introduces new language.

A legal requirement changes customer-facing copy.

A new market requires localization.

A deprecated term needs removal.

A genuine product requirement conflicts with an existing content rule.


Change rule

Do not change terminology casually.

Any change to a core marketplace term should be documented and reviewed before it becomes the new standard.


---

31. FINAL STANDARD

Every piece of BukieBrainJobs customer-facing content should answer three questions:

1. What does this mean?


2. Why does it matter?


3. What should I do next?



If the copy does not make those answers clear, rewrite it.

This version is the one I recommend we use going forward. It preserves the original guide while fixing the areas that could have conflicted with the product architecture, legal content, engineering documentation, and our controlled geographic marketplace model. 0 1