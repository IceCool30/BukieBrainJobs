# BukieBrainJobs Release and Operations Baseline

**Document ID:** OPS-000
**Version:** 1.0
**Status:** Approved baseline

## Environment Progression

```text
local → development → staging → production
```

Production credentials must never be used for local development.

## Deployment Architecture

The approved technical baseline uses a serverless-first web architecture with managed persistence and a persistent real-time service:

- Next.js web/PWA on Vercel.
- Expo mobile application distributed through EAS.
- Managed PostgreSQL with PostGIS.
- Managed Redis for cache, rate limiting, pub/sub and BullMQ.
- Persistent Socket.io service on Railway or Render.
- Managed external services for payments, identity, messaging, storage, email, analytics and monitoring.

Do not introduce microservices or additional distributed infrastructure without a documented reliability, scale or ownership reason.

## CI/CD Gate

Pull requests should validate:

1. Dependency installation.
2. Linting.
3. Type checking.
4. Unit tests.
5. Integration tests where applicable.
6. Build validation.
7. Security checks.
8. Documentation consistency.

Production deployment requires review and approval according to repository governance.

### UI-only deployment phase

Until the user explicitly approves backend and database integration, frontend deployments must not connect to a database or run migrations. The `Deploy Web` workflow therefore runs Prisma migrations only when the repository variable `RUN_DATABASE_MIGRATIONS` is explicitly set to `true`.

Vercel Git integration is the production deployment path during this phase. The workflow's manual Vercel CLI deployment is deliberately disabled unless `RUN_CLI_VERCEL_DEPLOY` is explicitly set to `true`, preventing duplicate deployments and unconfigured Vercel credentials from blocking frontend releases.

Before enabling database migrations for the first backend release, configure a valid production `DIRECT_URL` GitHub Actions secret, verify the direct connection is appropriate for Prisma migrations, and complete the database release checks. Before enabling the manual Vercel CLI gate, configure valid `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` GitHub Actions secrets. Do not enable either gate merely because a frontend deployment is ready.

## Secrets

CI secrets belong in GitHub Actions secret storage. Application deployment secrets belong in the appropriate hosting environment. Never commit secret values.

## Observability

The approved baseline includes Sentry for error monitoring and PostHog for product analytics. Operational logging must be structured and must exclude sensitive information.

## Rollback and Failure Handling

Deployments must have a known rollback path. Failed migrations, external-service failures, webhook failures and real-time outages must degrade safely and preserve transactional integrity.

## Production Readiness

Before production, verify:

- Database backups and recovery strategy.
- Environment configuration.
- Monitoring and alerting.
- Webhook idempotency.
- Rate limits.
- Security review.
- Accessibility review.
- Performance review.
- E2E coverage for critical journeys.
- Release documentation.
