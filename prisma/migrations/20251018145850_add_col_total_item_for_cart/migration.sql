/*
  Warnings:

  - Added the required column `total_item` to the `carts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "carts" ADD COLUMN     "total_item" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "cartUserIdIdx" ON "carts"("user_id");
