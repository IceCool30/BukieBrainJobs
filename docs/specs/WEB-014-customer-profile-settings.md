# Spec: WEB-014 Customer Profile & Account Settings

**Status**: Accepted

## Decision
Implement the customer profile and account management surface at the canonical `/profile` route. This surface gives authenticated customers direct control over personal identity, saved service locations, account credentials, notification routing, and account data governance. The implementation adheres strictly to the approved 7-phase product roadmap (Phase 1.1 in `docs/master-checklist.md`), follows the authenticated shell layout, enforces customer data isolation, and uses Mr. Solomon Natural Voice with locked design system tokens.

## Requirements

1. **Canonical Route and Shell Integration**:
   - Canonical route is `/profile`.
   - Supports sub-sections or tabbed panels: `Personal Details`, `Saved Addresses`, `Security`, `Notifications`, and `Account`.
   - Integrates with the authenticated shell: desktop sidebar and persistent mobile bottom navigation bar.
   - Preserves return navigation paths and redirects unauthenticated visitors to `/login?returnUrl=/profile`.

2. **Personal Profile Management**:
   - View and edit customer full name (first name, last name).
   - Nigerian phone number editing with format validation (`+234` or `080...` standard).
   - Email address management with verification status indicator.
   - Profile avatar display with initials fallback using Deep Navy `#001A41` and Emerald `#296A4B` brand accents.

3. **Saved Addresses Manager**:
   - Manage multiple saved service locations (e.g., Home in Lekki, Office in Victoria Island).
   - Supported Nigerian cities (Lagos, Abuja, Port Harcourt, Ibadan, Kano, and active service areas).
   - Detailed address fields: street address, neighborhood or district, city, state, and mandatory landmark instructions for technician dispatch.
   - Controls to add a new address, edit an existing address, designate a default service address, and remove an address with confirmation.
   - Scoped strictly to the authenticated customer; saved locations can pre-fill future booking and job posting flows.

4. **Account Security and Credentials**:
   - Password change interface requiring current password confirmation and enforcing complexity rules (minimum 8 characters with mixed case and digits).
   - Authentication provider overview showing linked sign-in methods (Google, Apple, Phone OTP, Email).
   - Active session overview with current device badge and global sign-out action.

5. **Notification Preferences**:
   - Channel toggles across SMS, WhatsApp, Email, and In-App alerts.
   - Preference groupings: Booking updates and technician dispatch notices, messaging alerts, and promotional announcements.
   - Instant persistence with accessible success feedback.

6. **Account Data Governance**:
   - Data export request providing a downloadable summary of customer profile, booking history, and receipts.
   - Account deactivation and deletion flow with an explicit confirmation modal, clear explanation of active booking impacts, and safe cancellation safeguards.

7. **Authorization and Customer Data Isolation**:
   - All profile queries and mutations must be scoped to the authenticated `customerId`.
   - Queries for non-existent profiles or cross-customer access attempts fail closed.
   - Implemented via a deterministic mock repository (`CustomerProfileRepository`) that preserves state across page navigation within the session.

8. **Design, Accessibility, and Brand Voice**:
   - Follows locked `DESIGN.md` tokens: Deep Navy `#001A41` primary, Emerald `#296A4B` strategic accent.
   - Hanken Grotesk for section titles, Inter for form labels, descriptions, and buttons.
   - Mobile touch targets meet the 48px minimum height requirement.
   - Form inputs include clear labels, `aria-describedby` error associations, and WCAG 2.2 AA compliant contrast.
   - Zero em dashes across user-facing text, error messages, and documentation.
   - Plain, direct language without corporate filler or artificial cheerfulness.

9. **Deterministic State Handling**:
   - Loading skeletons during profile and address data loading.
   - Inline form validation with unambiguous error feedback per field.
   - Clear success confirmations upon saving changes.
   - Localized error notices with retry buttons if an operation fails.
   - Read-only banner when in offline mode.

## Acceptance Criteria

1. Authenticated customer navigates to `/profile` and views their personal information, saved addresses, security credentials, and notification settings.
2. Unauthenticated visitors attempting to view `/profile` are redirected to `/login?returnUrl=/profile`.
3. Updating personal details updates the session profile and displays a clear confirmation notice.
4. Adding, editing, setting default, and deleting saved addresses works reliably and validates Nigerian address and landmark fields.
5. Password update flow rejects invalid current passwords and enforces complexity requirements.
6. Notification preference switches save immediately and reflect accurate channel states.
7. Account deletion requires explicit modal confirmation and handles active bookings safely.
8. Cross-customer access attempts or unauthorized mutations fail closed with explicit errors.
9. All interactive modals trap focus properly and restore focus to trigger buttons on dismissal.
10. Monorepo test suites pass with zero regressions and zero em dashes in test titles or descriptions.
