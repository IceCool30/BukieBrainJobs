# Security Policy

## Scope

BukieBrainJobs handles marketplace accounts, identity information, bookings, communications and payments. Security is a product requirement from the beginning.

## Reporting a vulnerability

Do not publish suspected vulnerabilities in a public issue.

Until a dedicated security reporting address is established, report security concerns privately to the repository owner through GitHub's private security reporting mechanisms.

Include:

- Affected component
- Reproduction steps
- Expected behavior
- Actual behavior
- Potential impact
- Relevant logs or evidence with secrets and personal data removed

## Security requirements

All production changes must consider:

- Authentication
- Authorization and role enforcement
- Input validation
- Rate limiting
- Session and token security
- Secret management
- Payment webhook verification
- Identity-verification webhook verification
- File upload controls
- Output encoding and XSS protection
- CSRF protections where applicable
- Database access controls
- Sensitive-data handling
- Auditability
- Dependency security
- Logging and monitoring

## Secrets

Never commit credentials or secrets. Use GitHub Actions Secrets, hosting-provider environment variables, and approved secret-management systems.

## Dependency security

Dependencies should be reviewed before introduction and monitored continuously. Security fixes take priority over cosmetic maintenance.

## Production principle

No feature is production-ready until its security requirements and abuse cases have been reviewed.
