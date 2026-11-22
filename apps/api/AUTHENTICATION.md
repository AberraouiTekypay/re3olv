# Institutional OIDC setup

The API accepts OIDC access tokens signed with `RS256`. Configure `OIDC_ISSUER` and a dedicated API resource `OIDC_AUDIENCE` on the API. The issuer must publish a standard OpenID Connect discovery document and RSA JWKS. Configure the web app with the same issuer and audience plus its public OIDC client ID (`NEXT_PUBLIC_OIDC_ISSUER`, `NEXT_PUBLIC_OIDC_AUDIENCE`, and `NEXT_PUBLIC_OIDC_CLIENT_ID`). The authorization request must return an access token whose audience is the API resource; do not configure the API to accept ID tokens. Set the provider's supported `audience` or `resource` parameter where needed. Register `https://<web-origin>/auth/callback` as an allowed redirect URI and use Authorization Code flow with PKCE.

An authenticated identity is not granted a role from token claims or request headers. Its OIDC `sub` must match a provisioned `User.oidcSubject` row. The database row's `role` and `organizationId` define access. Provision or remove those mappings through a trusted operator workflow; never create them from unauthenticated signup data. Supported roles are `AGENT`, `MANAGER`, and `PLATFORM_ADMIN`.

Borrower links use a separate random token, expire after seven days, and can be revoked by issuing a replacement link. Borrower routes accept that token in the `x-borrower-token` header. The case ID alone does not authorize access.

See `.env.example` files for variable names. The current migration lock and runtime adapter use SQLite while the Prisma schema says PostgreSQL. Resolve that mismatch in Sprint 2 before applying migrations to production or enabling real data.
