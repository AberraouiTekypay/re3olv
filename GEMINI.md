# re3olv Project Context

## Project Overview
`re3olv` is a case management and resolution platform.
- **re3olv-backend**: NestJS-based API with Prisma and SQLite.
- **re3olv-frontend**: Next.js-based frontend with Tailwind CSS 4 and Shadcn components.

## Technology Stack
### Backend (`re3olv-backend/`)
- **Framework**: NestJS (v11+)
- **ORM**: Prisma (v7+) with `better-sqlite3` adapter.
- **AI**: Google Generative AI (`gemini-3-flash`) for hardship analysis.
- **Database**: SQLite.
- **Testing**: Jest.
- **Package Manager**: pnpm.
- **Prisma Client**: Generated in `re3olv-backend/generated/prisma`.

### Frontend (`re3olv-frontend/`)
- **Framework**: Next.js (v16+) - **WARNING**: This version has breaking changes.
- **Styling**: Tailwind CSS 4, Vanilla CSS.
- **Components**: Shadcn/UI (Radix-based).
- **Language**: TypeScript.

## Project Structure
### Backend (`re3olv-backend/`)
- `src/cases/`: Core business logic.
  - `advocacy-brain.service.ts`: Integrates Gemini AI for processing hardship stories.
  - `cases.service.ts`: Manages case states and generates settlement options.
- `src/main.ts`: Configures global `/api` prefix, port 3001, and CORS.
- `prisma/schema.prisma`: Defines the `Case` model and states (`OPEN`, `RESOLVED`, `ADVOCACY`).

### Frontend (`re3olv-frontend/`)
- `src/app/resolve/[caseId]/`: Settlement selection flow for users.
- `src/app/agent/dashboard/`: Agent dashboard for case management.

## Business Logic
- **Case States**: `OPEN`, `RESOLVED`, and `ADVOCACY` (triggered by hardship analysis).
- **Settlement Options**: Dynamically generated as Lump Sum (50%), Short-term (70%), and Long-term (90%) of the total amount.

## Development Standards
- **Environment Variables**: `GEMINI_API_KEY` is required for backend AI features.
- **TypeScript**: Strictly typed development.
- **Prisma**: Update `re3olv-backend/prisma/schema.prisma` and run migrations for database changes.
- **Commits**: Follow standard commit message practices.
