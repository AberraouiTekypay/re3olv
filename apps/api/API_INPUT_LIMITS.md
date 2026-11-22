# API input limits and retries

- Case CSV uploads require an authenticated manager, a `.csv` filename, an accepted CSV MIME type, and a UUID `Idempotency-Key` header.
- Uploads are limited to 5 MB, 5,000 data rows, 1 MB per CSV row, 200 characters per borrower name, and positive monetary values with at most two decimal places. All rows must be valid. A rejected upload is recorded as `FAILED` and creates no cases; valid rows and `COMPLETED` status are committed together.
- Reusing an upload key with the same file returns the existing batch. Reusing it with different content returns a conflict. Generate a new key when correcting a failed upload.
- Settlement amounts must be positive, have no more than two decimal places, and cannot exceed the outstanding balance. Repeating an already completed settlement with the same amount or resolution with the same option returns the existing result.
- Hardship stories are trimmed and limited to 5,000 characters. Gemini requests have a 20-second SDK timeout.
- PostgreSQL connections, statements, and interactive transactions have finite configurable timeouts; see `.env.example`.
- Public borrower endpoints use an in-process fixed-window limit (default 60 requests per minute per route and client IP; hardship analysis defaults to 10). Configure the limits in deployment variables. Set `TRUST_PROXY_HOPS` to the actual trusted proxy chain so the API can identify client IPs safely.
- Case upload requests default to a separate limit of 10 per minute per client IP.

The rate limiter is local to one API process. Before running multiple instances or serving public production traffic, enforce a shared limit at the trusted edge or use a shared rate-limit store. This repository does not configure such an edge policy. No load test or deployment-side limit verification has been run.
