UPDATE "Case"
SET "magicToken" = NULL, "magicLinkCreatedAt" = NULL
WHERE "magicToken" IS NOT NULL;
