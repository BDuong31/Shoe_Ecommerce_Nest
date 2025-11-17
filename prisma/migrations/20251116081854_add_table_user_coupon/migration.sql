/*
  Warnings:

  - Added the required column `name` to the `coupons` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserCouponStatus" AS ENUM ('available', 'used', 'expired');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "current_usage_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "max_discount" DOUBLE PRECISION,
ADD COLUMN     "min_spend" DOUBLE PRECISION,
ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ADD COLUMN     "total_usage_limit" INTEGER;

-- CreateTable
CREATE TABLE "user_coupons" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "coupon_id" VARCHAR(36) NOT NULL,
    "status" "UserCouponStatus" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "user_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userCouponUserIdIdx" ON "user_coupons"("user_id");

-- CreateIndex
CREATE INDEX "userCouponCouponIdIdx" ON "user_coupons"("coupon_id");

-- CreateIndex
CREATE INDEX "userCouponStatusIdx" ON "user_coupons"("status");

-- CreateIndex
CREATE UNIQUE INDEX "userCouponUniqueIdx" ON "user_coupons"("user_id", "coupon_id");
