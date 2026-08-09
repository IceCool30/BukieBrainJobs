# BukieBrainJobs Security Baseline

**Document ID:** SEC-000
**Version:** 1.0
**Status:** Approved baseline

## Security Principles

Security is a product requirement and applies to every role and platform surface.

## Identity and Authentication

- JWT-based authentication is the approved baseline.
- Access tokens should be short-lived.
- Session and refresh-token handling must follow the approved technical specification.
- OTP is handled through the approved Nigerian SMS provider integration.
- Server-side authorization is mandatory. Client-side role checks are not security boundaries.

## Authorization

Every protected route and mutation must enforce the user's role and resource ownership on the server.

Roles include Client, BrainWorker, Admin and Corporate Client.

## Input and Data Protection

- Validate external input with shared Zod schemas where applicable.
- Keep business rules in shared service/domain layers rather than UI code.
- Do not trust client-provided prices, roles, permissions or state transitions.
- Monetary values are represented in kobo in application and API contracts.

## Payments

Paystack webhook requests must be cryptographically verified and processed idempotently. Payment state changes must not depend on unverified client requests.

## Identity Data

Sensitive identity and banking information must be protected at rest. The technical baseline specifies encryption for sensitive identity fields and environment-managed encryption keys.

## Rate Limiting and Abuse Prevention

Redis-backed rate limiting is required for sensitive operations such as authentication and other abuse-prone endpoints.

## Webhooks

All external webhooks must verify authenticity, validate payloads, enforce idempotency, and produce auditable processing records.

## Secrets

- Never commit secrets.
- Never place production credentials in local development files tracked by Git.
- Use managed environment variables and CI secret storage.
- `.env.example` must contain names and safe placeholders only.

## Logging and Privacy

Logs must not expose passwords, OTPs, authentication tokens, full identity numbers, bank credentials or other sensitive personal data.

## OWASP-Oriented Controls

Engineering reviews should explicitly consider authentication failures, authorization bypass, injection, insecure direct object references, sensitive-data exposure, security misconfiguration, vulnerable dependencies, SSRF, XSS/CSRF risks where relevant, and unsafe file uploads.

## Security Gate

A feature is not production-ready until relevant security requirements and abuse cases have been reviewed and the documentation reflects any material decisions.
