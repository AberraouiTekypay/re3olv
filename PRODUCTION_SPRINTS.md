# Production Readiness Sprints

This backlog turns the pre-production audit into a staged release plan. A sprint is complete only when its acceptance criteria are met and the changes are reviewed and verified in the target deployment environment.

## Sprint 1 — Identity, tenant isolation, borrower access

**Goal:** Make every case operation require a verifiable identity and enforce organization boundaries.

- Replace caller-supplied `x-user-role` and `x-organization-id` trust with authenticated principals and server-side role/organization membership.
- Scope every institutional case query and mutation to the authenticated organization; remove the current unscoped case lookup pattern.
- Require a valid, expiring, revocable borrower token on borrower portal reads and writes. Do not expose case data or allow resolution actions based on a case ID alone.
- Align frontend calls with the API routes for case retrieval, settlement options, view tracking, hardship chat, and chat history.
- Prevent sensitive tokens from being returned in routine API responses or unnecessarily logged.

**Acceptance:** Unauthenticated requests fail; forged role/tenant headers do not grant access; cross-tenant access fails; borrower access requires a valid unexpired token; portal actions call existing API routes and enforce token authorization.

## Sprint 2 — Production data and key management

**Goal:** Make persistence durable and cryptographic keys explicit.

- Choose one production database architecture and align the Prisma schema, adapter, migrations, seed process, and runtime configuration with it.
- Remove hardcoded local SQLite paths from service constructors; use explicit environment configuration and a shared lifecycle-managed database client.
- Require a production encryption key at startup; remove the fallback key and define key rotation and ciphertext versioning behavior.
- Confirm backups, restore procedures, migration ordering, and retention/deletion behavior for borrower data.

**Acceptance:** A clean production-like deployment can migrate and connect to the configured durable database; application instances share the intended database; startup fails clearly when required secrets are absent; backup and restore are documented and exercised.

## Sprint 3 — Input validation and resilient processing

**Goal:** Bound untrusted input and prevent partial or misleading operations.

- Add upload size, row count, file type, and required-field limits; reject absent files safely.
- Stream or bounded-batch CSV processing, validate monetary values and ranges, and make batch status reflect actual completion/failure.
- Validate DTOs for settlement amounts, option IDs, hardship stories, branding/config updates, and other write routes.
- Make multi-step writes transactional where partial state would be unsafe; add idempotency for retryable upload/action flows.
- Add rate limits and request timeouts for public/token-authenticated and AI-backed operations.

**Acceptance:** Invalid/oversized requests are rejected with safe errors; failed imports do not appear completed; retries do not duplicate cases or financial actions; request limits are effective under expected production load.

## Sprint 4 — Deployment security and release verification

**Goal:** Make the deployed system usable and observable without demo-only behavior.

- Replace localhost URL fallbacks with validated deployment configuration; generate borrower links from the configured public origin.
- Restrict CORS to approved frontend origins and methods; review security headers and CSP against actual production assets.
- Replace the simulated waitlist success flow with a real persisted submission or remove the form until it is connected.
- Remove mock payment/provider flows and demo seed data from production paths; clearly gate any remaining sandbox integrations.
- Add production health/readiness checks, structured redacted logs, alerting, and deployment/rollback instructions.
- Run and document unit, integration, security, migration, and end-to-end checks against a production-like environment.

**Acceptance:** Deployment uses no localhost endpoints or demo credentials/data; browser and API flows work end to end; CORS and headers match the deployment; release checks pass and rollback steps are documented.

## Release gate

Do not enable real borrower or institutional data until Sprints 1 and 2 are complete. Do not enable external production traffic until all four sprints meet their acceptance criteria and the release checks pass.

## Current progress

Sprint 1 implementation is in progress: OIDC-backed institutional roles, organization-scoped case operations, explicit borrower-token routes, hashed seven-day borrower tokens, and aligned portal endpoints are in place. Sprint 1 still needs real OIDC configuration, provisioned user mappings, database migration deployment, and acceptance checks before it can be marked complete.
