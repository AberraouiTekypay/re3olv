# PostgreSQL operations

## Configuration

Set `DATABASE_URL` to the provider's pooled PostgreSQL connection for API traffic. Set `DIRECT_URL` to a direct connection for Prisma CLI migrations and seeding. Both must use TLS in hosted environments. Store credentials in the deployment secret manager; do not commit a populated `.env` file.

The API uses one Nest-managed Prisma client and pool per application instance. Set `DATABASE_POOL_MAX` against the database's total connection limit and the maximum number of running instances. Connection, idle, SQL statement, and transaction timeouts are configurable with the `DATABASE_*_MS` variables in `.env.example`.

## Initial deployment and migrations

The canonical `prisma/migrations/0_init_postgresql` migration is a baseline generated from the current Prisma schema. Review it against the intended production schema and apply it to an empty PostgreSQL database with `pnpm exec prisma migrate deploy` from `apps/api`. For an existing PostgreSQL database, first compare its schema with the baseline and use Prisma's baselining procedure; do not run the initial migration over existing tables. The prior SQLite migration history is retained under `prisma/migrations-sqlite-legacy` and must not be deployed to PostgreSQL. Later schema changes use sequential migrations in `prisma/migrations`; Sprint 3 adds upload idempotency columns after the baseline.

The seed script contains synthetic demo records and personal-looking names. Run it only against an isolated development database, never a production database. Production schema deployment does not require running the seed.

## Backups and restore

Before production data is enabled, configure the database provider's automated backups and point-in-time recovery (PITR), with a retention period approved for the applicable jurisdiction. The provider is not selected in this repository, so backup scheduling and PITR must be configured in that provider's control plane.

For an additional logical backup, run `pg_dump --format=custom --no-owner --file=re3olv-YYYYMMDD.dump "$DIRECT_URL"` from a protected operations environment. Restore into a newly provisioned, isolated PostgreSQL database with `pg_restore --no-owner --dbname="$RESTORE_URL" re3olv-YYYYMMDD.dump`. Protect dumps as regulated data, encrypt them at rest and in transit, restrict access, and expire them according to approved retention policy. Never restore over production as a rehearsal.

Record backup age, retention, encryption, access, and restore evidence in the deployment runbook. Rehearse a restore into an isolated environment and verify application connectivity and required records before enabling real data. No production database, backup schedule, retention period, or restore has been configured or exercised by this repository change.

## SQLite transition

Local SQLite files and historical SQLite migration SQL are preserved. No SQLite database has been read, altered, or exported as part of this sprint. If any SQLite database contains required records, plan and verify a separate export, transformation, and import into PostgreSQL before cutover. Do not treat the schema baseline as a data migration.
