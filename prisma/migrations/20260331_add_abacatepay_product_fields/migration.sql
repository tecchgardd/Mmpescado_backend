ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "abacatePayProductId" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "abacatePaySyncedAt" TIMESTAMP(3);
CREATE UNIQUE INDEX IF NOT EXISTS "Product_abacatePayProductId_key" ON "Product"("abacatePayProductId");
