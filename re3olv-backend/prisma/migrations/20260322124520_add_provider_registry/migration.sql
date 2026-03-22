-- CreateTable
CREATE TABLE "ProviderRegistry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "countryCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "apiConfig" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_ActiveProviders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ActiveProviders_A_fkey" FOREIGN KEY ("A") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ActiveProviders_B_fkey" FOREIGN KEY ("B") REFERENCES "ProviderRegistry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ActiveProviders_AB_unique" ON "_ActiveProviders"("A", "B");

-- CreateIndex
CREATE INDEX "_ActiveProviders_B_index" ON "_ActiveProviders"("B");
