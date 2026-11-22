-- Create a unique request identity for each upload within an organization.
ALTER TABLE "BatchUpload"
ADD COLUMN "idempotencyKey" TEXT,
ADD COLUMN "requestHash" TEXT;

CREATE UNIQUE INDEX "BatchUpload_organizationId_idempotencyKey_key"
ON "BatchUpload"("organizationId", "idempotencyKey");
