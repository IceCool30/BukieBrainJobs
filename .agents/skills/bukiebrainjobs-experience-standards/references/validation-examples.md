# Validation Examples From the Approved Live Experience

These examples show how to apply the quality gates to the live BukieBrainJobs homepage. They are examples of reasoning, not layouts to duplicate.

## Example 1: Desktop Service Discovery

The desktop service section passes the live-first review when it preserves the following.

| Quality gate | Live evidence | Review conclusion |
|---|---|---|
| Image-led card | The service card places a real service image above its concise title and contained starting-price label. | Use photos when a service is easier to recognize visually. |
| Surface language | The card uses a white surface, rounded corners, a thin border, and controlled depth. | Do not replace it with a dense brand-colour block or generic icon tile. |
| Pointer-specific feedback | The title colour and image feedback respond through the card group on hover. | Keep hover-only feedback inside pointer-capable media rules. |
| Mobile independence | The desktop card treatment does not require hover information for comprehension. | A touch user can still understand and use the card without hover. |

## Example 2: Mobile Service Discovery

The PWA service section passes the live-first review when it preserves the following.

| Quality gate | Live evidence | Review conclusion |
|---|---|---|
| Service-first hierarchy | The section begins with a direct action heading and a two-column service grid. | Do not insert a long informational block ahead of discovery. |
| Perceptible but restrained discovery motion | The section uses `motion-reveal` and `motion-reveal-item` after entering the viewport. | Use a short discovery cue rather than constant movement. |
| Touch feedback | Service cards use the shared `motion-press` pattern and visible focus treatment. | Touch feedback should be noticeable without moving the layout. |
| Search focus | The mobile search uses the shared `motion-focus` pattern. | Focus must communicate that typing will produce service matches below the field. |
| Reduced motion | Global rules leave the content visible when reduced motion is requested. | Never hide content behind an animation preference. |

## Example 3: Mobile Header Without Blur

The PWA homepage passes the mobile header requirement when `Navbar` receives `hideOnPwa`.

| Quality gate | Live evidence | Review conclusion |
|---|---|---|
| Compact control | The PWA path renders only the fixed 44px menu control after scroll settlement. | Do not restore a wide header or information strip. |
| Blur-free mobile behavior | The PWA-specific early return does not render the desktop scrolled header, which uses a separate backdrop treatment. | A desktop scrolled header treatment must not leak into the mobile PWA. |
| Accessible drawer | The menu exposes an accessible label, opens a controlled drawer, closes with Escape, and restores page scrolling. | Preserve these behaviors in any navigation refactor. |

## Example 4: Claim and Copy Review

A service-card title such as `Generator repair` needs no generic tagline below it. The imagery, title, contained price cue, and destination explain the task. If supporting text is added, it must answer a genuine decision question, follow the content guide, and avoid invented proof such as ratings, number of professionals, broad coverage, or guarantees.
