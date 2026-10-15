# Dependabot Alert Triage

**Document ID:** SEC-001
**Version:** 1.0
**Status:** Open, tracked separately from BW-004
**Recorded:** 2026-10-03
**Source:** GitHub Dependabot alerts on `IceCool30/BukieBrainJobs`

## Why this is a separate track

BW-004 has not changed application code or dependencies. The diff from the
post-BW-003 commit (`d268ff8`) touches only rules, documentation, and one
guard script. No `package.json` and no lockfile changed.

Folding these alerts into BW-004 would misattribute pre-existing findings to
that workstream and hide a high-severity item inside unrelated review noise.
This record exists so the findings survive independently of any feature merge.

## Open alerts

Four alerts are open. All four are `runtime` scope in `pnpm-lock.yaml`.

| # | Severity | Package | GHSA | CVE | CVSS | Vulnerable | Fix | Installed |
|---|---|---|---|---|---|---|---|---|
| 1 | high | undici | GHSA-rfgv-xxqx-mfg5 | CVE-2026-19534 | 7.5 | >= 6.7.0, < 6.28.1 | 6.28.1 | 6.28.0 |
| 2 | medium | undici | GHSA-3wwx-pv8p-q78v | CVE-2026-85024 | 5.9 | >= 6.25.0, < 6.28.1 | 6.28.1 | 6.28.0 |
| 3 | medium | fast-uri | GHSA-hrr3-gc8f-f4qj | CVE-2026-86472 | 4.8 | >= 4.0.0, < 4.1.5 | 4.1.5 | 4.1.4 |
| 4 | medium | fast-uri | GHSA-jvvf-x445-j334 | CVE-2026-86818 | 4.8 | >= 4.1.3, < 4.1.5 | 4.1.5 | 4.1.4 |

Advisory summaries:

1. undici vulnerable to Denial of Service via unrequested WebSocket subprotocol.
2. undici vulnerable to Denial of Service via unhandled error in WebSocket
   permessage-deflate decompression.
3. fast-uri vulnerable to inconsistent host case normalization via
   percent-encoded octets.
4. fast-uri vulnerable to mailto header injection via percent-encoded
   field-name desynchronization.

## Answers to the five required questions

**Do they predate BW-004?** Yes. Both vulnerable packages and their installed
versions appear in the lockfile as committed at `d268ff8`, the post-BW-003
state. BW-004 introduced no dependency change, so it introduced neither the
findings nor the versions.

**Affected packages and dependency paths.**

- `undici@6.28.0` is transitive only. It is pulled through `tempy@0.7.1`,
  `temp-dir@2.0.0`, and `tar@7.5.22`. None of these is declared in any
  `package.json` in the workspace, and none appears in the production
  dependencies of `apps/web`.
- `fast-uri@4.1.4` is reached through a pnpm `overrides` entry in the root
  `package.json`, `"fast-uri": "^4.1.4"`.

**Does the high-severity finding affect production runtime?** Not on current
evidence, and this is the item that most needs a human confirmation rather
than an assumption. Dependabot labels the scope `runtime`, but `undici` arrives
only through `tempy` and `tar`, which are build and test tooling. The WebSocket
DoS requires a WebSocket client or server path, and `apps/web` declares neither
`undici` nor any of its parents as a production dependency.

The honest position: the dependency path analysis says build tooling, the
Dependabot scope label says runtime, and those two disagree. Someone who owns
the deployment image should confirm what actually ships before this is closed.

**Tracked remediation or exception decision.** Not yet made. Proposed, not
decided:

- Refresh the lockfile so `fast-uri` moves to `4.1.5` and `undici` to `6.28.1`.
  The override `^4.1.4` is a caret range and already admits `4.1.5`, so the
  override is not blocking a fix. The stale lockfile pin is.
- Confirm the `undici` runtime question above, then either upgrade or record a
  documented exception with a rationale and a review date.
- No exception may be recorded as "accepted because unrelated to BW-004". The
  reason must be about exposure.

**Does BW-004 add any vulnerability?** No. It adds no code, no dependency, and
no lockfile entry. This is verifiable from the commit range and should be
re-verified at merge time.

## Required before the BW-004 merge

1. Confirm these four alerts predate BW-004 (`d268ff8` and earlier).
2. Identify affected packages and dependency paths, done above, re-confirm at
   merge.
3. Determine whether the high-severity `undici` finding reaches production
   runtime.
4. Record a remediation or exception decision for each alert.
5. Confirm BW-004 introduces no additional alert.

Item 3 blocks closure of the high-severity alert. Items 4 and 5 block the
BW-004 merge gate. None of them is satisfied by BW-004 staying
dependency-free.

## Related configuration gap

No Dependabot configuration file exists at `.github/dependabot.yml`, so alert
detection is running on GitHub defaults with no schedule or directory scoping
under repository control. Adding a config is a separate decision, not part of
BW-004.
