# Human Production Engineering Skill & Standards

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Human Production Engineering** is an universal AI agent skill and operational standard designed to force AI coding assistants to write **100% senior human-grade, production-ready code**.

It eliminates "AI-slop", naive happy-path assumptions, bare swallowed exceptions, and missing concurrency protection across any AI agent (Google Antigravity, Cursor, Windsurf, Cline, GitHub Copilot, Claude Code, Aider, Devin).

---

## The Problem: AI Code vs Human Engineering

| Dimension | Typical AI-Generated Code | Senior Human-Engineered Code |
| :--- | :--- | :--- |
| **Mindset** | **Optimistic**: Assumes networks never timeout and DBs never fail. | **Pessimistic & Defensive**: Anticipates partial failure, connection drops, and concurrency spikes. |
| **Error Handling** | Swallows errors with bare `except Exception: return None` or raw `print()`. | Explicit typed domain errors; isolates fatal from retryable errors; preserves stack traces. |
| **State Consistency** | Multi-step mutations execute sequentially without transactions. | Strict atomic transactions (`ACID`), row locks, rollback mechanics, and idempotency keys. |
| **Observability** | Naked `print()` / `console.log()` statements with zero trace metadata. | Structured contextual logging (`request_id`, `user_id`, `trace_id`), metrics, and alarms. |
| **Concurrency** | Assumes single-threaded execution; vulnerable to race conditions. | Guarded with atomic queries (`WHERE stock >= requested`), row-level locks, or mutexes. |

---

## The 6 Pillars of Production-Grade Code

1. **Robust Failure Boundaries & Typed Errors**: Zero swallowed exceptions. Always preserve stack trace context with `exc_info=True` or error causes.
2. **ACID Transactions & Concurrency Safety**: All multi-step database writes must run in atomic transactions. Mutating operations must accept and pass idempotency keys.
3. **Structured Observability**: Leveled loggers with contextual metadata. No raw `print()` or `console.log()` statements in production logic.
4. **Connection Pooling & Resource Lifecycle**: Always use context managers (`with`, `try-finally`). Never create unpooled ad-hoc connections.
5. **Strict Type Safety & Edge Validation**: Validate untrusted incoming data with runtime validators (Zod, Pydantic) at the edge before domain logic.
6. **Graceful Degradation & Backoff**: Exponential backoff with randomized jitter on transient retries. Circuit breakers on unstable downstream dependencies.

---

## Universal Installation Guide

### 1. Google Antigravity
To make this rule **always loaded globally** for all projects, models, and subagents:
```bash
# Clone and install globally into Antigravity
git clone https://github.com/IceCool30/human-production-engineering-skill.git
cp human-production-engineering-skill/rules/production-engineering-standard.md ~/.gemini/config/rules/
mkdir -p ~/.gemini/config/skills/human-production-engineering
cp human-production-engineering-skill/SKILL.md ~/.gemini/config/skills/human-production-engineering/
```
You can also invoke it directly via slash command: `/human-production-engineering`.

### 2. Cursor IDE
Copy the `.cursorrules` template to the root of your project:
```bash
cp human-production-engineering-skill/rules/.cursorrules /path/to/your/project/.cursorrules
```

### 3. Windsurf IDE
Copy the `.windsurfrules` template to the root of your project:
```bash
cp human-production-engineering-skill/rules/.windsurfrules /path/to/your/project/.windsurfrules
```

### 4. Cline & Roo Code
Copy the `.clinerules` template:
```bash
cp human-production-engineering-skill/rules/.clinerules /path/to/your/project/.clinerules
```

### 5. GitHub Copilot
Copy the instructions template into `.github/copilot-instructions.md`:
```bash
mkdir -p /path/to/your/project/.github
cp human-production-engineering-skill/rules/copilot-instructions.md /path/to/your/project/.github/copilot-instructions.md
```

### 6. Universal Agent Standard (`AGENTS.md`)
Copy `AGENTS.md` to your repository root for Aider, Devin, Codex, and OpenHands:
```bash
cp human-production-engineering-skill/AGENTS.md /path/to/your/project/AGENTS.md
```

---

## Examples Included

- [`examples/order_service_naive_ai.py`](./examples/order_service_naive_ai.py): Flawed AI-generated code demonstrating swallowed exceptions, race conditions, and lack of transaction rollback.
- [`examples/order_service_human_production.py`](./examples/order_service_human_production.py): Python implementation refactored with atomic transactions, idempotency keys, and structured logging.
- [`examples/order_service_production.ts`](./examples/order_service_production.ts): TypeScript + Prisma implementation with Zod schema validation and interactive transactions.

---

## License

MIT License. Copyright (c) 2026 Solomon Bukie.
