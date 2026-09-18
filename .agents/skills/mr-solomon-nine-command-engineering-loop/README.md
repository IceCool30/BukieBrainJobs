# Mr. Solomon 9-Command Engineering Loop

Mr. Solomon 9-Command Engineering Loop is a universal engineering loop and command OS for autonomous AI coding agents. Works on any project, any stack, any team.

```text
  /scope      (PLAN)     Coarse plan of what to build in docs/scope.md
  /audit      (CONTEXT)  Seed and maintain AGENTS.md context files
  /architect  (DECIDE)   Write build spec in docs/specs/
  /develop    (BUILD)    Implement against the spec (or record an Assumed spec)
  /check      (VERIFY)   Prove it runs, builds, and review the diff
  /test       (COVER)    Targeted test suite for this change
  /document   (WRITE)    PR body, changelog, and release note
  /sync       (REALIGN)  Catch context files up, surgically
  /debug      (FIX)      Root cause, minimal patch, regression
```

---

## Core Doctrine

Most AI coding agents fail because they try to do everything at once in a long chat thread. When the conversation gets long, the context window fills with failed attempts, and the agent begins to invent decisions or hallucinate.

NINE solves this with four basic laws:

1. **Each phase owns one job**: Planning, architecture, coding, verification, and documentation are strictly separated.
2. **State lives in files, not in chat**: The filesystem is the single source of truth (`AGENTS.md`, `docs/scope.md`, `docs/specs/`, `docs/check-log.md`). If the chat session restarts, the agent reads the files and picks up right where it stopped.
3. **`/develop` will not invent a load-bearing decision**: If an unexpected architectural choice appears during coding, the agent must stop and hand control back to `/architect`.
4. **`/debug` is off-rail anytime something breaks**: Bug fixing runs outside the normal sequence. It isolates root causes, applies a minimal patch, and hands a regression test to `/test`.

---

## The Nine Commands

| Command | Verb | Primary Job | Key Input | Key Output |
| :--- | :--- | :--- | :--- | :--- |
| **`/scope`** | `PLAN` | Break raw requests into ordered, verifiable work items | User requirements | `docs/scope.md` |
| **`/audit`** | `CONTEXT` | Survey codebase and create/update context files | Project structure | `AGENTS.md` |
| **`/architect`** | `DECIDE` | Make load-bearing technical decisions and write specs | `docs/scope.md`, `AGENTS.md` | `docs/specs/<feature>.md` |
| **`/develop`** | `BUILD` | Deterministically implement code against the approved spec | Build spec | Implemented code files |
| **`/check`** | `VERIFY` | Prove code compiles, types pass, and diff is surgical | Staged / unstaged diff | `docs/check-log.md` |
| **`/test`** | `COVER` | Write and run targeted tests for the changed scope | Modified code | Test files |
| **`/document`** | `WRITE` | Generate PR description, changelog, and release notes | `git diff` | `CHANGELOG.md`, PR body |
| **`/sync`** | `REALIGN` | Surgically update context files and mark tasks done | Completed tasks | `AGENTS.md`, `docs/scope.md` |
| **`/debug`** | `FIX` | Rapid root-cause diagnosis, minimal patch, regression test | Error log / stack trace | Surgical patch + test |

---

## Universal Quality & Content Standards

This skill applies three foundational standards to every project it touches. They are not optional and are not tied to any single product.

### 1. Mr. Solomon Natural Voice
All generated text, pull request summaries, documentation, and user communication must sound like a thoughtful, direct, practical human engineer:
- Simple, clear English with ordinary words.
- No corporate buzzwords ("it is imperative", "multifaceted", "paradigm shift", "seamless").
- **Strict rule**: Do not use em dashes anywhere in generated content. Use commas, colons, or clean sentence stops.
- State technical positions directly and honestly without fake diplomatic filler.
- Final self-check: does it sound like a real human message, use simple words, state the position clearly, and avoid inventing facts?

### 2. Strict Anti-Generic Guardrails (Zero Slop)
Generic placeholders make code and products look amateur. The agent must avoid:
- **No Generic Icons**: Every icon must represent a concrete, functional action. Never use decorative stars, random sparkles, or arbitrary shapes.
- **No Generic Taglines**: Avoid empty phrases like "Empowering your workflow" or "Built for the future". State the exact capability plainly.
- **No Generic Captions**: Captions must communicate specific data points or operational context, never "Screenshot of dashboard".
- **No Generic Tips**: Explainers and tips must contain genuine, non-obvious domain knowledge. Do not state the obvious.
- **No Generic Subheadlines**: Subheadlines must convey concrete technical bounds or verified outcomes.

### 3. Brand & Visual Experience Standards
- **Token Authority**: Extract design tokens directly from project configurations (`tailwind.config.ts`, theme variables, or design tokens). Never hardcode arbitrary hex colors.
- **Authority Order**: Live verified application > user's latest explicit direction > documented requirements > older mockups.
- **High Contrast**: Keep contrast above 4.5:1 for body copy.
- **Purposeful Motion**: Motion explains layout changes or confirms input. Never add decorative bouncing or ungrounded animations. Honor `prefers-reduced-motion`.
- **Live System Authority**: The live, verified application takes precedence over outdated mockups.
- **Calm Hierarchy & Realistic Content**: Primary benefit and action must be obvious. Prefer realistic data over placeholders.

---

## Repository Structure

```text
mr-solomon-nine-command-engineering-loop-skill/
├── SKILL.md                          # Primary agent runbook and command router
├── references/
│   ├── doctrine.md                   # Core philosophy and persistence laws
│   ├── voice-and-brand-standards.md  # Natural voice, anti-generic, brand rules
│   ├── commands.md                   # Operational runbook for all 9 commands
│   └── file-schemas.md               # Standard schemas for AGENTS.md, scope, and specs
├── templates/
│   ├── scope-template.md             # Template for docs/scope.md
│   ├── spec-template.md              # Template for docs/specs/<feature>.md
│   └── agents-md-template.md         # Template for AGENTS.md
└── scripts/
    └── nine-status.sh                # Script to inspect loop state and active phase
```

---

## Installation & Usage

### Agent Skills / Custom Skills Directory
Copy or clone into your agent skills folder:

```bash
git clone https://github.com/IceCool30/mr-solomon-nine-command-engineering-loop-skill.git
# then place the folder (or its contents) where your agent loads skills from
```

### Triggering
- Invoke any of the nine slash commands (`/scope`, `/audit`, `/architect`, `/develop`, `/check`, `/test`, `/document`, `/sync`, `/debug`).
- Or describe a substantial feature, new project, bug, or documentation task. The skill will select the appropriate starting phase.

### Typical Flows
- **New product**: `/scope` → `/architect` → `/develop` → `/check` → `/test` → `/document` → `/sync`
- **Existing codebase**: `/audit` first, then `/scope` for the next slice
- **Bug**: `/debug` immediately, then hand regression to `/test`
- **Tiny change**: `/develop` + `/check` may be enough

The skill is deliberately project-agnostic. Drop it into any repository and the quality standards travel with it.
