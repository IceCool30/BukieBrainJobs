---
name: human-production-engineering
description: Enforce 100% human-grade, production-quality code. Eliminates AI-slop, optimistic happy-path shortcuts, bare swallowed exceptions, and missing concurrency protection. Use whenever designing, writing, reviewing, or refactoring code to ensure high scalability, atomic transaction boundaries, strict idempotency, structured observability, and zero-downtime maintainability.
---

# Human Production Engineering Standards

This skill forces code generation, refactoring, and code review to adhere to senior human engineering standards rather than naive, optimistic AI code.

## When to Invoke This Skill
- You want code written defensively with full concurrency, ACID transaction protection, and explicit failure recovery.
- You are reviewing existing code to eliminate AI "hallmarks" (swallowed exceptions, raw print statements, missing timeouts, and lack of idempotency).
- Triggered manually via `/human-production-engineering`.

---

## The 6 Pillars of Production-Grade Code

### 1. Robust Failure Boundaries & Typed Errors
- **No Swallowed Exceptions**: Never use bare `except Exception: pass` or `catch (err) {}`.
- **Typed Error Hierarchy**: Define domain exceptions (e.g. `PaymentTimeoutError`, `ConcurrencyConflictError`).
- **Preserve Traces**: Always log with full traceback context (`logger.error("msg", exc_info=True)` or `throw new CustomError("msg", { cause: err })`).

### 2. ACID Transactions & Concurrency Safety
- **Atomic Operations**: All multi-step database writes must run within an explicit transaction block.
- **Race Condition Prevention**: Use atomic database updates with pre-conditions (`WHERE balance >= amount`) or row-level locking (`SELECT ... FOR UPDATE`).
- **Distributed Idempotency**: All mutating operations (charging money, sending webhooks, creating external accounts) must take an `idempotency_key`.

### 3. Structured Observability & Telemetry
- **No Raw Print Logs**: Replace all `print()` or `console.log()` with leveled loggers (`logger.info`, `logger.error`).
- **Context Enrichment**: Attach correlation IDs (`request_id`, `trace_id`, `user_id`, `entity_id`) to log statements.
- **Metric Emitting**: Emit metrics counters (`increment`, `histogram`) for success, failure, and execution latency.

### 4. Connection Pooling & Resource Lifecycle
- **Context Managers**: Always release resources with `with`, `using`, or `try...finally`.
- **Pool Connections**: Never instantiate a new database connection or HTTP client per request.
- **Bounded Timeouts**: Every network call, process invocation, and database query must define an explicit timeout.

### 5. Strict Type Safety & Edge Validation
- **Boundary Validation**: Validate untrusted incoming data with runtime validators (e.g. Zod, Pydantic) at the edge.
- **No `any` or Untyped Dictionaries**: Code within the domain must use explicit types, interfaces, or immutable dataclasses.

### 6. Graceful Degradation & Backoff
- **Exponential Backoff with Jitter**: When retrying transient failures, use exponential backoff with full jitter to avoid the thundering herd problem.
- **Circuit Breakers**: When downstream dependencies fail consistently, fail fast without cascading failures.

---

## Review Checklist for Every PR / Code Change
1. [ ] Are all database updates wrapped in transactions?
2. [ ] Are mutating external API calls idempotent?
3. [ ] Are all network calls protected by timeouts?
4. [ ] Are all errors caught explicitly with stack traces preserved?
5. [ ] Is logging structured with contextual IDs?
6. [ ] Are shared resources guarded against concurrent race conditions?
