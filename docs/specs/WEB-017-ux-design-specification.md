# Spec: WEB-017 In-App Messaging & Real-Time Chat UX Design Specification (v1.0)

| Field | Value |
|---|---|
| **Document ID** | WEB-017-UX |
| **Feature** | In-App Messaging & Real-Time Chat |
| **Status** | 🟢 Complete / Live |
| **Version** | 1.0 (Live in Production) |
| **Workstream** | Phase 1: Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop |
| **Architecture Contract** | WEB-017 Architecture Contract v1.0 |
| **Target Surfaces** | `/messages` (Conversation Hub), `/messages/[jobId]` (Active Chat Screen) |
| **Design Standards** | BukieBrainJobs Experience Standards & Content Guide |
| **Date** | 2026-09-23 |

---

## 1. Executive Summary & Design Principles

WEB-017 delivers the user experience for customer-to-BrainWorker in-app messaging. It provides customers and artisans with a focused, honest, and reliable channel to coordinate confirmed jobs: clarifying arrival times, sharing installation photos, confirming exact house landmarks, and resolving job questions.

### Core Experience Principles

1. **Job-Focused, Not Social**:
   Every element reinforces job delivery and escrow safety. There are no distracting social gimmicks, vanity status rings, or decorative animations.
2. **Honest Delivery States**:
   The interface never pretends a message is sent before the server acknowledges it. Sending, sent, delivered, read, and failed states are distinct and accessible.
3. **Calm Degradation on Variable Mobile Networks**:
   When poor connectivity interrupts WebSockets, the UI seamlessly transitions to polling fallback with quiet, non-panicky indicators. Offline text messages queue locally without losing user input.
4. **Accessible & Responsive by Default**:
   Works fluidly across desktop split-pane views and mobile single-column stacks with minimum 44px touch targets, high contrast, and full keyboard navigation.

---

## 2. Visual System & Brand Tokens

The interface adheres strictly to the approved BukieBrainJobs brand palette and geometry.

| Token Role | Hex Code | Applied Usage in Messaging |
|---|---|---|
| **Canvas Background** | `#F8F9FF` | Page surface, background behind chat bubble streams |
| **Container Surface** | `#FFFFFF` | Hub card backgrounds, composer bar, incoming message bubbles |
| **Primary Brand Navy** | `#001A41` | Headings, primary send buttons, outgoing customer message bubbles |
| **Supporting Brand Green** | `#296A4B` | Verified badges, read receipt checks, trust banners, location icons |
| **Accent Mint** | `#ABEEC8` | Focus rings, active selection outlines, unread count badge background |
| **Border Neutral** | `#E2E8F0` (`slate-200`) | Card outlines, composer top border, message dividers |
| **Text Primary** | `#0B1C30` | Headings, message content in incoming bubbles |
| **Text Muted** | `#64748B` (`slate-500`) | Timestamps, service category labels, delivery status labels |
| **Error Crimson** | `#DC2626` (`red-600`) | Failed transmission alert icon, retry action, upload error |

### Typography & Geometry
- **Headings**: Display font (`font-display font-bold text-[#001A41]`).
- **Body & Messages**: System sans-serif (`font-sans text-sm leading-relaxed`).
- **Containers & Modals**: `rounded-2xl` with subtle shadow (`shadow-[0_4px_20px_rgba(0,26,65,0.06)]`).
- **Input Fields & Buttons**: `rounded-xl` with high-contrast active states.

---

## 3. Conversation Hub (`/messages`)

The conversation hub is the central inbox accessible from the top navigation bar and customer dashboard.

### 3.1 Layout & Structure
- **Desktop (>= 768px)**: Rendered as an elegant master-detail view. The conversation list occupies a fixed-width left pane (`360px` or `380px`), while the right pane displays the active conversation. If no conversation is selected, the right pane displays a calm empty selection state.
- **Mobile (< 768px)**: Rendered as a dedicated full-screen list. Selecting a conversation pushes to `/messages/[jobId]`.

### 3.2 Header & Filter Bar
- **Page Title**: "Messages" (`text-2xl font-bold font-display text-[#001A41]`).
- **Active Filter Tabs**: "All Messages", "Active Jobs" (`CONFIRMED`, `IN_PROGRESS`), "Archived" (`COMPLETED`, `CANCELLED`).
- **Search Input**: "Search conversations..." field filtering threads by BrainWorker name or service title.

### 3.3 Conversation Thread Card Anatomy
Each item in the list displays:
1. **Avatar with Verification**: 48x48px round portrait of the BrainWorker with a small emerald shield badge (`#296A4B`) at the bottom right.
2. **Participant & Service**:
   - Line 1: BrainWorker full name (e.g. "Engr. Emeka Nwosu") + Relative timestamp (e.g. "12m ago").
   - Line 2: Service title (e.g. "Generator Servicing & Repair") + Booking reference (`BBJ-LAG-2026-0891`).
   - Line 3: Message snippet with sender attribution ("You: I have shared the gate code..." or "Emeka: On my way to Lekki now.") truncated to 1 line.
3. **Badges**:
   - Unread Badge: Compact pill with unread count (`bg-[#296A4B] text-white text-xs font-bold px-2 py-0.5 rounded-full`).
   - Lifecycle Status Pill: Subtle status indicator (e.g., "In Progress" in blue, "Completed" in slate).

---

## 4. Active Chat Screen (`/messages/[jobId]`)

The active conversation interface is where the customer and BrainWorker interact in real time.

### 4.1 Header Bar
- **Back Navigation**: Left arrow button returning to `/messages` (essential on mobile).
- **Participant Details**:
  - BrainWorker avatar (40x40px).
  - BrainWorker name (`text-sm font-bold text-[#001A41]`).
  - Booking reference code linking directly to the job detail screen (`/jobs?id={jobId}`).
- **Status Indicator**:
  - Connected: Quiet green indicator dot.
  - Polling Fallback: Yellow status pill ("Connecting... Polling updates").
  - Offline: Slate pill ("Offline").
- **Trust & Escrow Safety Banner**:
  A compact, non-intrusive banner pinned immediately below the header:
  > "Keep payments and communication on BukieBrainJobs. Off-platform payments are not protected by BukieGuarantee escrow."

### 4.2 Message Stream Viewport
Messages are rendered chronologically from top to bottom inside a scrollable container with automatic date dividers ("Today", "Yesterday", or "Monday, 21 September").

#### Outgoing Message (Customer)
- **Alignment**: Right-aligned.
- **Bubble Styling**: Solid Deep Navy (`bg-[#001A41] text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[82%] sm:max-w-[70%] shadow-sm`).
- **Metadata**: Right-aligned timestamp (`text-[11px] text-slate-300`) accompanied by delivery status icon.

#### Incoming Message (BrainWorker)
- **Alignment**: Left-aligned.
- **Bubble Styling**: Crisp white (`bg-white text-[#0B1C30] border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[82%] sm:max-w-[70%] shadow-sm`).
- **Metadata**: Left-aligned timestamp (`text-[11px] text-slate-400`).

### 4.3 Distinct Message Delivery States (Accessible Visuals)

State is communicated through both iconography and text alternatives, never color alone:

| State | Visual Icon | Accessibility Text | Description |
|:---|:---|:---|:---|
| **`sending`** | Clock icon (`Clock`, 12px, opacity 60%) | "Sending..." | Optimistic message in client queue or flight. |
| **`sent`** | Single checkmark (`Check`, 12px, slate-300) | "Sent" | Server acknowledged persistence. |
| **`delivered`** | Double checkmark (`CheckCheck`, 12px, slate-300) | "Delivered" | Delivered to recipient device. |
| **`read`** | Double checkmark (`CheckCheck`, 12px, emerald `#ABEEC8`) | "Read" | Recipient opened conversation. |
| **`failed`** | Alert triangle (`AlertCircle`, 12px, red-400) + "Retry" button | "Failed to send. Retry" | Network timeout or error. Click to retry. |

---

## 5. Media & Attachment Experience

### 5.1 Photo Selection & Upload Pipeline
1. **Trigger**: Camera / Paperclip icon button (`min-h-[44px] min-w-[44px]` for touch target).
2. **File Selection**: Native browser picker restricted to `image/jpeg, image/png, image/webp`.
3. **Upload Staging Box**: When selected, a thumbnail preview appears docked above the composer:
   - 64x64px thumbnail with rounded corners.
   - File name and size (e.g., `breaker_panel.jpg • 1.8 MB`).
   - Progress ring or animated bar showing upload percentage.
   - Cancel button (`X`) allowing immediate abort via `AbortController`.
4. **Offline Handling**: If clicked while offline, an accessible toast notification appears:
   "Photo upload requires an active internet connection."
5. **Timeline Rendering**:
   - Rendered as an aspect-ratio-constrained photo card (`max-h-64 object-cover rounded-xl`).
   - Tapping the image opens an accessible full-screen image lightbox.

---

## 6. Location Sharing Experience (One-Time Snapshot)

### 6.1 User-Initiated Location Action
- Location sharing is strictly user-initiated; it never runs automatically in the background.
- Triggered by clicking the "Share Location" button (Map Pin icon) in the composer.

### 6.2 Confirmation Modal
A confirmation modal opens before transmission:
- **Title**: "Share Job Location"
- **Address Context**: Displays the verified street address, landmark, and city from the booking record.
- **User Note**: "This sends your job location to {workerName} so they can navigate directly to your address."
- **Actions**: "Cancel" (secondary) and "Send Location Card" (primary `#001A41`).

### 6.3 Chat Timeline Location Card
Rendered as a structured interactive card:
- Map Pin icon in emerald `#296A4B`.
- Bold headline: "Job Location Snapshot".
- Street address: "14 Admiralty Way, Lekki Phase 1, Lagos".
- Landmark: "Opposite Domino's Pizza".
- External Action: "Open in Google Maps" button (`min-h-[40px] text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-white`).

---

## 7. Composer & Inactive States

### 7.1 Active Composer
- **Layout**: Sticky bottom container (`bg-white border-t border-slate-200 p-3 sm:p-4`).
- **Input Field**: Auto-expanding textarea (`min-h-[44px] max-h-32 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#001A41] px-3.5 py-2.5 text-sm`).
- **Keyboard Shortcut**: `Enter` sends message; `Shift + Enter` creates a newline.
- **Character Counter**: Subtle text counter (`1,650 / 2,000`) appearing when comment exceeds 1,500 characters.
- **Send Button**: Deep Navy `#001A41` button with white send icon. Disabled when input is whitespace.

### 7.2 Read-Only Archived State (`COMPLETED` or `CANCELLED`)
When a booking is no longer active, the composer is completely replaced by a calm read-only card:
- Icon: Shield Check or Lock icon in slate-400.
- Copy: "This booking was completed on {date}. Messaging is closed." (or "This booking was cancelled. Messaging is closed.").
- Actions: Helpful links to "View Receipt" (`/receipt/${jobId}`) or "Book Again".

---

## 8. Degraded Network, Loading, & Empty States

### 8.1 Zero Conversations Hub Empty State
- **Surface**: Center-aligned card inside `/messages`.
- **Icon**: `MessageSquare` in soft navy/slate circle.
- **Heading**: "No active conversations yet"
- **Body**: "When you book a verified BrainWorker, your direct chat thread will appear here so you can coordinate arrival times, tools, and job details."
- **Primary CTA**: "Browse Services" (`href="/services"`).

### 8.2 Zero Messages in Confirmed Job Empty State
- **Surface**: Center of chat stream for freshly matched jobs.
- **Illustration**: Handshake or verified check.
- **Heading**: "Your booking with {workerName} is confirmed"
- **Body**: "You can send a message to confirm the arrival window, provide gate security details, or clarify job requirements."

### 8.3 Connection Degraded Banner
- When polling fallback activates, a small pill banner appears above the composer:
  - Yellow dot + "Reconnecting... Polling for updates every 4s."
  - Does not prevent the user from typing or viewing existing messages.

### 8.4 Unauthorized / Inaccessible Conversation
- Fail-closed security screen:
  - Heading: "Conversation Not Found or Restricted"
  - Body: "You do not have permission to view this conversation. Messages are restricted strictly to confirmed booking participants."
  - CTA: "Return to My Jobs" (`href="/jobs"`).

---

## 9. Accessibility & Mobile Standards

1. **Screen Reader Live Region**:
   - An off-screen container with `aria-live="polite"` announces incoming messages: "New message from {workerName}: {contentSnippet}".
2. **Keyboard Focus & Trapping**:
   - After a message sends, focus stays in the textarea for rapid typing.
   - Escape key dismisses photo lightboxes and location modals, restoring focus to trigger buttons.
3. **Mobile Master-Detail Viewport**:
   - Mobile screens utilize full viewport height (`h-[100dvh]`) to prevent mobile browser URL bar jumping.
   - Fixed composer uses safe-area padding (`pb-safe`) for iPhone home indicator bars.
4. **Contrast Verification**:
   - Outgoing navy bubbles: `#001A41` with `#FFFFFF` text = **16.1:1** contrast ratio (exceeds WCAG AAA).
   - Incoming white bubbles: `#FFFFFF` with `#0B1C30` text = **15.4:1** contrast ratio.
   - Timestamps `#64748B` on `#FFFFFF` = **4.6:1** contrast ratio (exceeds WCAG AA).
