# BukieBrainJobs: light mode and dark mode with one toggle

Approved on 23 October 2026. This spec overrides the dark-only rules in older docs and in the design-system skill copy.

## What I found

The light theme was taken out on 17 October in commit `789aad4` ("dark mode is the only theme on web, PWA and mobile"). The docs were changed to match in `b1b0e31`. Only four commits have landed on main since then: BW-007 scheduling, BW-008 on-site, BW-009 completion and a small build fix.

Reversing `789aad4` on today's main applies cleanly with no conflicts. That brings back the old theme engine, the light colour tokens in `globals.css`, the early theme script that stops a white flash on load, and the old toggle.

Almost all of the web code reads its colours from theme variables (over 4,300 uses), so most pages switch on their own once the light tokens are back. The exception is the new on-site page (`app/onsite/[bookingId]/page.tsx`), which has 7 hard-coded dark colours. Those get fixed.

The old light colour set is still in `packages/ui/src/tokens/colors.ts`: off-white canvas `#F7F9FC`, white cards, navy `#001A41` text, a navy top strip, green and orange. That matches the navy and green brand in your experience standards.

The old toggle sat in seven places at once: the main navbar, the phone top bar, the jobs sidebar, the profile sidebar, the BrainWorker header, the PWA home header and the dashboard header. That is the clutter to avoid this time.

## Decisions I need you to confirm

**1. Light colours.** I'll bring back the old light set and fix the colours that are hard to read on white. As text on white, orange `#FF6B35` is 2.8:1 and the old green `#10B981` is 2.5:1, both below the 4.5:1 minimum. In light mode only, orange text and green text get darker shades. The orange button gets a slightly deeper fill (`#CC4A14`, 4.6:1 with white text), the same fix you approved on THE SECOND ME site. Dark mode stays exactly as it is now.

**2. One toggle, one place per screen.** A single button that flips between light and dark, showing a sun or a moon icon with a clear label for screen readers. It lives in the navigation each screen already has:

| Where | Placement |
|---|---|
| Public pages on desktop | Right end of the top navbar, after the main buttons. One small icon button. |
| Public pages on phone, and the PWA | Last row of the menu drawer: "Dark mode" with the switch. The crowded top bar stays as it is. |
| Signed-in areas (customer dashboard, jobs, profile, BrainWorker area) | Bottom of the account sidebar or menu, one row. Not in every page header. |
| Native mobile app | Small icon button in the home screen header, next to the logo. The choice carries to the other screens. |

**3. First visit (decided).** Dark for everyone until they tap the toggle. After that their choice is remembered. The device light or dark setting is not used.

**4. Remembering the choice in the native app.** The app has no storage library. I'll add `@react-native-async-storage/async-storage`, the standard Expo package for this, so the app remembers the choice after it closes. Without it, the app follows the phone setting and the toggle resets each time the app opens.

**5. Docs and agent rules.** DESIGN.md, AGENTS.md, README, CLAUDE.md, GEMINI.md, `.clinerules`, the design-system docs and the repo's copy of the design-system skill all say dark only. On this branch I'll change them to describe light and dark with one toggle. Otherwise the next agent that reads them will strip light mode out again. Your separate skill repo (`IceCool30/bukiebrainjobs-trades-design-system`) and your Manus skill stay as they are until you merge.

## How I'll do it

1. New branch `feature/light-dark-theme` from main.
2. Reverse `789aad4` to get the engine and light tokens back.
3. Replace the seven old toggle spots with the placements above, using one toggle component.
4. Apply the light contrast fixes, fix the on-site page colours, and check the BW-007, BW-008 and BW-009 screens in light mode.
5. Browser bar colour follows the mode on web and PWA. Mobile app status bar and splash follow the mode.
6. Update the docs and the in-repo skill copy.
7. Run the type-check, the tests and a full web build, then take desktop and phone screenshots of the main pages in both modes. The mobile app gets a type-check. I can't run it on a real phone from here.
8. Push the branch, which triggers a Vercel preview build per AGENTS.md, and open a draft pull request. I won't merge it.

No images, video or other paid generation is involved.

## Status on this branch

Done: dark default token set with a refined light set, no device-based switching, fresh storage key `bbj_theme_mode` so everyone starts dark, toggle kept only in the navbar (desktop), the menu drawer (phone and PWA), the jobs and profile sidebars, the dashboard header and the BrainWorker header. Task screens follow the saved choice. On-site page colours moved to tokens. Mobile app has the same light colours, dark default and a toggle on the home screen header.

Checked on 23 October 2026: web type-check clean, mobile type-check clean, 1,759 of 1,759 web tests pass, production build passes. A contrast scan of all 29 public routes found 20 low-contrast items in light against 36 in the current dark mode. The remaining ones are text over photos or semi-transparent chips the scan cannot measure. Green labels on navy surfaces use `--nav-accent` in light and `--brand-green` in dark. The mobile app remembers the choice with AsyncStorage and the status bar follows the mode.

Rules for future work: use theme tokens for every colour on a theme surface. Fixed white text is only for photos, the navy strip and filled buttons. On navy surfaces in light mode, use `--nav-accent` for green accents.

Signed-in check on 23 October 2026, as a customer and as a BrainWorker: 15 pages (dashboard, jobs, profile, messages, notifications, post a job, book, and the BrainWorker dashboard, leads, bookings, availability, services, wallet, profile and verification status). Light mode has 0 low-contrast items, against 23 in dark. Orange text inside pale orange chips uses the deeper orange in light mode. The Leads page button had a fixed orange and now uses the theme token.
