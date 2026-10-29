# Legacy Source Boundary

Status: Canonical governance

Historical project exports, research notes, branch summaries and imported design-source files are retained as evidence and context. They do not automatically become current product requirements.

## Canonical authority

1. Approved product specifications
2. Approved design system and visual tokens
3. Approved technical specification
4. Approved security, accessibility and QA requirements
5. Operational prompts and agent instructions
6. Historical research and project notes

Lower-level artifacts must not override higher-level approved decisions.

## Known historical material

Some historical materials use TaskRabbit, Tasker, Candidate, Employer, recruitment or other terminology that predates the current BukieBrainJobs marketplace model.

Those materials must remain available for research and traceability, but agents must not copy their terminology, flows, launch assumptions or product claims into current implementation unless an approved current specification explicitly adopts them.

## Design-source boundary

The supplied root `DESIGN.md`, the original DS-001 through DS-012 palette, the retired Trades skill, its static HTML examples, and older screen-spec color samples are retained for history and traceability. They are not current visual authority.

For web/PWA appearance, use `.agents/skills/bukiebrainjobs-outlier-design-system/SKILL.md`. For theme behavior, persisted preference, and toggle placements, use `docs/specs/THEME-001-light-dark-toggle.md`. The native UI visual rollout is deferred, so do not apply the web/PWA restyling to native screens without a separate approved scope.

Legacy product-language passages in `DESIGN.md` are governed by `docs/02-design-system/DESIGN-CANONICALIZATION.md` and must not be interpreted as BukieBrainJobs product requirements. Feature and UX specifications remain authoritative for product behavior, content requirements, and acceptance criteria; only their superseded visual examples are non-authoritative.

## Research boundary

The TaskRabbit playbook and similar research documents inform strategy. They are not normative implementation specifications.

## Rule for agents

When historical and current sources disagree, do not guess. Follow the current authority hierarchy and record a decision when the conflict materially affects implementation.
