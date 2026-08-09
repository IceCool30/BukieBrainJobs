# Plan: Master `AGENTS.md`

## Objective

Replace the root `AGENTS.md` with a concise (under 200 lines), repo-specific source of truth for coding agents.

## Evidence reviewed

- `DESIGN.md` defines the Corporate Modern / Premium Minimalism design system.
- `PRODUCT_ROADMAP.md` is not present in this workspace.
- Root and workspace manifests show the current implementation uses Next.js 15.1, Expo SDK 52, and `packages/ui`, `packages/types`, and `packages/store`.
- The existing guide describes some intended technologies that are not currently implemented (for example, an Express API, Prisma, Clerk, and payment/identity integrations).

## Proposed changes

1. Replace `AGENTS.md` using the requested headings: role and system context, project overview, high-availability tech stack, development phase, design system, workflow, and boundaries.
2. Put verified setup and validation commands first, including workspace-targeted commands where the root Turbo scripts do not apply.
3. Distinguish the current codebase from future platform architecture so agents do not invent inactive backend integrations or contradict installed versions.
4. Add progressive-disclosure pointers to `DESIGN.md`, `README.md`, and any present `GEMINI.md`, `CLAUDE.md`, or `.cursorrules` files; do not create symbolic links unless they are supported and useful in this repository.
5. Preserve the Phase 1 mock-data requirement, accessibility/design tokens, chat anti-bypass rule, type-safety expectations, and approval boundaries.
6. Verify the result is under 200 lines, free of obsolete directory claims, and readable as a stand-alone agent guide.

## Validation

- Count lines in `AGENTS.md`.
- Review the diff.
- Run no application build because this documentation-only change does not affect runtime code.
