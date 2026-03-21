# RE3OLV: Institutional Debt Advocacy Platform

RE3OLV is a high-fidelity, full-stack case management and debt resolution platform designed for Microfinance Institutions (MFIs). It leverages Generative AI to automate hardship detection and facilitate empathetic, legally binding debt settlements.

## 🚀 System Overview

The platform is built on a modern, institutional-grade stack:

- **Backend**: NestJS (v11+) - A progressive Node.js framework for efficient, reliable, and scalable server-side applications.
- **Frontend**: Next.js (v16+) - React framework for high-performance borrower portals and agent dashboards.
- **Database**: SQLite with Prisma ORM - Type-safe database access and automated migrations.
- **AI Engine**: Google Gemini 3 Flash - Powering **Nova**, the Advocacy Brain, for real-time hardship analysis.
- **Open Banking**: Mock Plaid-style bridge for verified cash flow analysis.

## 🛠 Core Architecture

### 1. The Advocacy Flow
The borrower journey is automated through a proactive engagement loop:
1. **Magic Link**: Agents generate secure, expiring tokens for proactive borrower outreach.
2. **Nova Chat**: Users interact with Nova (AI) to share their hardship story.
3. **Hardship Detection**: Gemini 3 Flash analyzes the story (or verified cash flow) to detect job loss, illness, or financial distress.
4. **Shield Activation**: Upon detection, the "Advocacy Shield" is triggered, automatically freezing fees and waiving penalties (up to $50).
5. **Dynamic Settlement**: Nova facilitates a legally binding settlement through one-time payments or installment plans.

### 2. 360 Admin & Institutional Management
The agent workspace provides complete institutional visibility:
- **RBAC (Role-Based Access Control)**: Strictly enforced permissions for `AGENT` (Case Management) and `MANAGER` (Institutional Analytics).
- **Multi-Tenancy**: Strict `OrganizationId` isolation ensures MFIs only see their own portfolio.
- **Credit Intelligence**: Real-time financial health radar featuring global debt snapshots and verified cash flow analysis.
- **Impact Analytics**: Professional B2B dashboard tracking Portfolio ROI, Social Impact scores, and Recovery Velocity.

## 🔐 Compliance & Security
- **EU AI Act 2026 Ready**: Integrated explainability logs and mandatory AI transparency disclosures.
- **GDPR Compliance**: Built-in "Right to be Forgotten" data erasure protocols.
- **Audit Trails**: Immutable agent action logs tracking every AI trigger and institutional manual override.

## 🚦 Getting Started

### Backend (`/re3olv-backend`)
```bash
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run start:dev
```

### Frontend (`/re3olv-frontend`)
```bash
npm install
npm run dev
```

---
*RE3OLV 1.0 - Hardened for institutional debt resolution.*
