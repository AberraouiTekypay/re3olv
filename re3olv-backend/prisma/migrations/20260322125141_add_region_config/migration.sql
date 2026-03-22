-- CreateTable
CREATE TABLE "RegionConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "countryCode" TEXT NOT NULL,
    "activeAdapters" TEXT,
    "complianceRules" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RegionConfig_countryCode_key" ON "RegionConfig"("countryCode");
