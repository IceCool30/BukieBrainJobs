# BukieBrainJobs Source Material Register

**Document ID:** GOV-006
**Version:** 1.0
**Status:** Approved foundation

This register distinguishes canonical repository documentation from historical source material supplied during project development.

## Canonical Project Sources

| Source | Role | Canonical authority |
|---|---|---|
| `DESIGN.md` | Visual source of truth | Yes, visual system |
| `BukieBrainJobs — Full-Stack Technical Specification.md` | Detailed engineering reference | Yes, technical reference |
| `BukieBrainJobs_TaskRabbit_Playbook.md` | Marketplace research and strategy | Research / strategic reference |
| Approved DS-001 through DS-012 | Design-system decisions | Yes, within design authority |
| WEB-001 and related approved artifacts | Feature requirements | Yes, feature authority |

## Local Source Fingerprints

These SHA-256 values identify the supplied source files used during repository consolidation:

```text
DESIGN.md
f1fb8244556dcf94b0f85e79550060d5adfe961e820a01618bd177d7aa6a7094

BukieBrainJobs — Full-Stack Technical Specification.md
94ec3d65606f8b38b8d6d561c89e2cc2d2263c2e44dae69a0d4e268ea635d221

BukieBrainJobs_TaskRabbit_Playbook.md
519018e063893c57097fa19aaaf0b0e2047220a3159e9c1b17ac06c732cde59a

Project Breakdown Summary.txt
 dba356c6577cb9497159aba4d7ddabc06b3612b415b499f7a861bb09a7c38768
```

## Consolidation Policy

The repository should contain the canonical documents future agents need. Historical branch summaries, repeated conversation exports and duplicate project breakdown files should not be copied into the canonical documentation tree merely because they exist.

Where a source document is too large for an automated repository write in a single operation, its authoritative status must still be recorded here and its fingerprint preserved. A later repository maintenance pass may mirror the complete source verbatim without changing its content.

## Conflict Rule

Research and historical source material cannot silently override approved product, design or engineering decisions. Material conflicts must be recorded in the decision log and resolved at the appropriate authority level.
