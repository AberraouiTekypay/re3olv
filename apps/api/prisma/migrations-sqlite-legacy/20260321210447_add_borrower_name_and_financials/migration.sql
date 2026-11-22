-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerName" TEXT NOT NULL DEFAULT 'Anonymous',
    "principalAmount" REAL NOT NULL DEFAULT 0,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "isFeeFrozen" BOOLEAN NOT NULL DEFAULT false,
    "penaltyWaived" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "selectedOptionId" TEXT,
    "hardshipReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Case" ("createdAt", "hardshipReason", "id", "isFeeFrozen", "penaltyWaived", "selectedOptionId", "status", "totalAmount", "updatedAt") SELECT "createdAt", "hardshipReason", "id", "isFeeFrozen", "penaltyWaived", "selectedOptionId", "status", "totalAmount", "updatedAt" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
