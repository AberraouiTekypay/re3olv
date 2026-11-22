-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#4f46e5',
    "secondaryColor" TEXT NOT NULL DEFAULT '#0f172a',
    "legalName" TEXT,
    "supportEmail" TEXT,
    "regulatoryDisclaimer" TEXT DEFAULT 'RE3OLV is an institutional debt facilitator. All AI interactions with Nova are recorded for quality and compliance.'
);
INSERT INTO "new_Organization" ("id", "name") SELECT "id", "name" FROM "Organization";
DROP TABLE "Organization";
ALTER TABLE "new_Organization" RENAME TO "Organization";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
