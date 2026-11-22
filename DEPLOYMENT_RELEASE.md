# Production release runbook

This runbook describes an application release. It does not provision identity, payment, ERP, or region-specific data services. Payment and ERP adapter methods, settlement writes, and generated restructuring offers are deliberately unavailable when `NODE_ENV=production` until live integrations and approval controls are implemented.

## Required configuration

Configure secrets through the hosting platform, not committed files. Use separate values per environment.

| Service | Required settings |
| --- | --- |
| API | `DATABASE_URL` (TLS PostgreSQL runtime URL), `DIRECT_URL` (TLS direct migration URL), `ENCRYPTION_KEYS_JSON`, `CURRENT_ENCRYPTION_KEY_ID`, `OIDC_ISSUER`, `OIDC_AUDIENCE`, `WEB_APP_URL`, `CORS_ALLOWED_ORIGINS`, `TRUST_PROXY_HOPS` |
| Web | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_OIDC_ISSUER`, `NEXT_PUBLIC_OIDC_CLIENT_ID`, and the provider's configured OIDC audience/resource and scopes |

Set `CORS_ALLOWED_ORIGINS` to comma-separated exact HTTPS origins, with no paths or trailing slash. `WEB_APP_URL` and `NEXT_PUBLIC_API_URL` must use HTTPS in production. Web `NEXT_PUBLIC_*` values are embedded at build time: set them before creating the production build. Never put secrets in a `NEXT_PUBLIC_*` variable.

The example environment files contain placeholders and must not be used as production credentials. Do not run the synthetic Prisma seed against production.

## Release sequence

1. Build and deploy the API and web artifacts to a staging environment using production-like settings and non-production data.
2. Apply reviewed, backward-compatible database migrations using the direct connection before deploying code that requires the new schema. Use expand-and-contract migrations across releases; avoid destructive schema changes in the same release that first stops using a column/table.
3. Check `GET /api/health/live` for process health and `GET /api/health/ready` for API plus database readiness. Configure platform probes against these endpoints.
4. Exercise authentication, authorization, CORS, upload limits, and database reads/writes with staging identities. Confirm that production settlement and restructuring endpoints return unavailable until a live provider is installed.
5. Promote the verified artifacts and watch API 5xx rate, latency, database connection saturation, authentication failures, and readiness status.

## Incident response and rollback

- Alert on failed liveness/readiness probes, sustained 5xx rate, latency objectives, database pool exhaustion, repeated OIDC validation failures, and unusual upload/rate-limit rejection volume.
- Logs and alerts must not include access tokens, borrower names, account numbers, request bodies, or raw database connection strings. Use request IDs and sanitized error codes for correlation.
- If the application release causes errors, route traffic back to the last known-good application artifact. Roll back database changes only when the migration was explicitly designed to be reversible; otherwise restore service compatibility with a forward fix.
- Before any data restore, stop writes, verify the backup and point-in-time recovery target, and coordinate the recovery with the data owner. Record the incident timeline and validate readiness before reopening traffic.
- Keep a tested backup and recovery procedure, key rotation process, and a named operational owner before production launch.

## Current production limitations

- The API exposes basic liveness and database readiness probes. Centralized structured logging, metrics, and alert rules must be configured by the deployment platform.
- This release does not configure actual residency-aware database routing. Response headers are not evidence of data partitioning or residency.
- Payment settlement, live payment links, ERP reads, and lender-backed restructuring offers require real provider implementations and end-to-end operational approval before enabling.
