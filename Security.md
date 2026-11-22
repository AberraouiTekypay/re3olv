# RE3OLV Security & Compliance Notes

This document describes implemented controls and remaining production work. Product copy and compliance claims must be reviewed against the requirements in each operating jurisdiction before release.

## ⚖️ EU AI Act 2026 Compliance

RE3OLV records AI-assisted hardship decisions. This logging alone does not establish regulatory compliance; legal review and jurisdiction-specific controls remain release requirements.

### 1. Decision Logging
The application writes `ComplianceAudit` and `DecisionLog` records when the hardship analysis activates the Advocacy Shield. Review the generated reasoning and confidence fields before using them as evidence of a decision or compliance determination.

### 2. Borrower Disclosure
The portal includes an AI disclosure and consent screen. Its text and consent record need jurisdiction-specific legal review; the current UI does not persist a durable consent artifact.

## 🔐 Data Security & Privacy

### 1. Encryption Status
The encryption service now requires an explicit production keyring (`ENCRYPTION_KEYS_JSON` plus `CURRENT_ENCRYPTION_KEY_ID`) and uses authenticated, versioned AES-256-GCM envelopes with key IDs. Keep retired keys configured until all ciphertext written under them has been re-encrypted; the service exposes `reencrypt` for that controlled rotation. No fallback key or legacy ciphertext compatibility is provided. The `encryptedData` schema field and service are not yet wired into sensitive-field persistence, so this alone does not make borrower data safe to store.

### 2. Data Deletion
An organization-scoped case deletion endpoint exists. Relation deletion behavior and retention requirements have not been verified; do not treat the endpoint as a complete erasure workflow until dependent records and backup retention have been reviewed.

### 3. Institutional Access and Tenant Isolation
Institutional routes now require an RS256 OIDC access token. The OIDC `sub` must map to a provisioned `User.oidcSubject`; the database role and organization membership determine access. Caller-supplied role and organization headers are not authorization. Case list, detail, update, delete, and outreach operations are scoped to the authenticated organization. Configure the issuer, dedicated API audience, and user mappings before enabling institutional access.

Public borrower routes have in-process rate limits and the hardship model request has a 20-second timeout. The in-process limiter does not coordinate multiple API instances; enforce an additional shared limit at the trusted edge or with shared storage before multi-instance public production traffic.

## 📝 Institutional Audit Trail
Some operational actions are recorded in `ActionLog`. The current database does not make these records immutable; preserve and protect audit data through database controls and a verified retention policy. Events include:
- **NOVA_SHIELD_TRIGGER**: Automatic hardship detection.
- **MAGIC_LINK_VIEW**: Borrower engagement tracking.
- **MANUAL_OVERRIDE**: Human-in-the-loop intervention.

---
*RE3OLV Compliance Team &middot; 2026*
