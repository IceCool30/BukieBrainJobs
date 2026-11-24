# Test-Driven Development (TDD) Skill

Production-grade Test-Driven Development skill for AI coding agents.

Drives development with tests. Use when implementing any logic, fixing any bug, or changing any behavior. Proves that code works before and after changes.

## What It Enforces

* **Red-Green-Refactor**: Write a failing test first to prove the need, write the minimal code to pass, and refactor cleanly.
* **The Prove-It Pattern**: Reproduce every bug with a focused test before touching production code.
* **Stack Discovery**: Inspect package manifests and test frameworks before running commands.
* **Focused Feedback Loops**: Run only the targeted test suite during development to maintain speed and efficiency.
* **Runtime Verification**: Verify browser-based changes with real browser automation and console inspection.

## Repository Structure

```
agent-skills-test-driven-development-skill/
├── SKILL.md                          # Main agent runbook and TDD protocols
└── references/
    └── testing-patterns.md           # Testing patterns, anti-patterns, and language examples
```

## Installation

```bash
git clone https://github.com/IceCool30/agent-skills-test-driven-development-skill.git
```

Place the folder or its contents in your agent skills directory (for example, `.agents/skills/agent-skills-test-driven-development`).

## Usage

Apply this skill whenever implementing new logic, fixing bugs, refactoring existing code, or adding edge-case handling.
