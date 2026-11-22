-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "borrowerName" TEXT NOT NULL DEFAULT 'Anonymous',
    "isSME" BOOLEAN NOT NULL DEFAULT false,
    "founderName" TEXT,
    "founderImpact" TEXT,
    "principalAmount" REAL NOT NULL DEFAULT 0,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "creditScore" INTEGER NOT NULL DEFAULT 600,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isFeeFrozen" BOOLEAN NOT NULL DEFAULT false,
    "penaltyWaived" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "selectedOptionId" TEXT,
    "hardshipReason" TEXT,
    "magicToken" TEXT,
    "magicLinkCreatedAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" DATETIME,
    "lastNudgedAt" DATETIME,
    "settledAt" DATETIME,
    "nextFollowUp" DATETIME,
    "organizationId" TEXT NOT NULL,
    "batchUploadId" TEXT,
    "encryptedData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Case_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Case_batchUploadId_fkey" FOREIGN KEY ("batchUploadId") REFERENCES "BatchUpload" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Case" ("batchUploadId", "borrowerName", "createdAt", "creditScore", "encryptedData", "hardshipReason", "id", "isFeeFrozen", "isVerified", "lastNudgedAt", "lastViewedAt", "magicLinkCreatedAt", "magicToken", "nextFollowUp", "organizationId", "paidAmount", "penaltyWaived", "principalAmount", "selectedOptionId", "settledAt", "status", "totalAmount", "updatedAt", "viewCount") SELECT "batchUploadId", "borrowerName", "createdAt", "creditScore", "encryptedData", "hardshipReason", "id", "isFeeFrozen", "isVerified", "lastNudgedAt", "lastViewedAt", "magicLinkCreatedAt", "magicToken", "nextFollowUp", "organizationId", "paidAmount", "penaltyWaived", "principalAmount", "selectedOptionId", "settledAt", "status", "totalAmount", "updatedAt", "viewCount" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
CREATE UNIQUE INDEX "Case_magicToken_key" ON "Case"("magicToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
