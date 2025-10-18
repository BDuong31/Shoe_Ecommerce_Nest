/*
  Warnings:

  - Added the required column `public_id` to the `images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "images" ADD COLUMN     "public_id" VARCHAR(255) NOT NULL;
