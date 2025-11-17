/*
  Warnings:

  - Added the required column `type` to the `images` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ImageType" AS ENUM ('product', 'rating');

-- AlterTable
ALTER TABLE "images" ADD COLUMN     "type" "ImageType" NOT NULL;

-- RenameIndex
ALTER INDEX "imageProductIdIdx" RENAME TO "imageRefIdIdx";
