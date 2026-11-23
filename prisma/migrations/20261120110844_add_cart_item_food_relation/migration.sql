-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "foodId" TEXT;

-- CreateIndex
CREATE INDEX "CartItem_foodId_idx" ON "CartItem"("foodId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE SET NULL ON UPDATE CASCADE;
