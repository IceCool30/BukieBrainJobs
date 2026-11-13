# Senior Human Production Engineering & Code Standard

Apply these rules unconditionally to all code generation, refactoring, debugging, and task executions across all projects, models, and subagents:

## 1. Strictly Banned Patterns (Zero Tolerance)
- **NO Swallowed Exceptions**: Never write bare `except Exception: return None`, empty `catch (e) {}`, or catch-all blocks that discard the stack trace. If catching, either log with full stack trace (`exc_info=True`) or reraise.
- **NO Raw Print Debugging**: Never use `print()` or `console.log()` for logging or error handling in production code. Use structured, leveled loggers (`logger.info`, `logger.error`).
- **NO Unbounded Network/IO**: Never call external HTTP services, message queues, or child processes without explicit timeouts, retry policies, and backoff with jitter.
- **NO Non-Transactional Mutations**: Never execute multi-step database mutations sequentially without an explicit atomic transaction boundary (`with conn.transaction():` / `prisma.$transaction(...)`). If step N fails, steps 1..N-1 must roll back.
- **NO Silent Concurrency Flaws**: Never assume single-threaded execution. Always use atomic row locking (`WHERE stock >= requested`), idempotency tokens, or distributed locks when mutating shared balances, stock, or status.
- **NO Hardcoded Magic Constants**: Never hardcode URLs, credentials, timeouts, or batch sizes inline in business logic. Extract them into strongly-typed configurations.

## 2. Mandatory Architectural Requirements
- **Explicit Domain Errors**: Create typed, domain-specific exceptions (e.g., `PaymentGatewayTimeoutError`, `InsufficientInventoryError`). Differentiate transient (retryable) errors from permanent (fatal) errors.
- **Structured Observability**:
  - Attach contextual metadata to every operational log (`user_id`, `request_id`, `order_id`, `trace_id`).
  - Emit metrics on critical system boundaries (success, failure, duration).
- **Resource Lifecycle Hygiene**:
  - Always clean up resources using context managers (`with`, `try-finally`, `using`).
  - Use connection pooling rather than instantiating ad-hoc database or HTTP client connections.
- **Type Safety & Fail-Fast Boundaries**:
  - Validate external payloads at system boundaries using schemas (Zod, Pydantic, dataclasses) before reaching domain logic.
  - Write strict, non-permissive types. Avoid `any` or untyped dictionaries when domain shapes are known.
- **Idempotency on Write Operations**:
  - Every mutating external API call or background job worker must take and pass an idempotency key to prevent double execution on network retries.
