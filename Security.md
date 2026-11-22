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
The schema has an `encryptedData` field and an encryption service, but sensitive fields are not consistently encrypted before persistence and the service currently has an unsafe fallback key. Do not store regulated financial or identity data until Sprint 2 replaces the fallback and wires encryption into the data paths.

### 2. Data Deletion
An organization-scoped case deletion endpoint exists. Relation deletion behavior and retention requirements have not been verified; do not treat the endpoint as a complete erasure workflow until Sprint 2 validates all dependent records and backups.

### 3. Institutional Access and Tenant Isolation
Institutional routes now require an RS256 OIDC access token. The OIDC `sub` must map to a provisioned `User.oidcSubject`; the database role and organization membership determine access. Caller-supplied role and organization headers are not authorization. Case list, detail, update, delete, and outreach operations are scoped to the authenticated organization. Configure the issuer, dedicated API audience, and user mappings before enabling institutional access.

## 📝 Institutional Audit Trail
Some operational actions are recorded in `ActionLog`. The current database does not make these records immutable; preserve and protect audit data through database controls and a verified retention policy. Events include:
- **NOVA_SHIELD_TRIGGER**: Automatic hardship detection.
- **MAGIC_LINK_VIEW**: Borrower engagement tracking.
- **MANUAL_OVERRIDE**: Human-in-the-loop intervention.

---
*RE3OLV Compliance Team &middot; 2026*
