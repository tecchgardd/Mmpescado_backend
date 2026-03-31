ALTER TABLE "Product"
ADD COLUMN     "abacatePayProductId" TEXT,
ADD COLUMN     "abacatePaySyncedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Product_abacatePayProductId_key" ON "Product"("abacatePayProductId");
