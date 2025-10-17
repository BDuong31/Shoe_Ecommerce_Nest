-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'pending', 'inactive', 'banned', 'deleted');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Processing', 'Shipped', 'Delivered', 'Canceled');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('fixed', 'percentage');

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "password" VARCHAR(100) NOT NULL,
    "wallet_address" VARCHAR(255),
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" DEFAULT 'active',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "street_address" VARCHAR(255) NOT NULL,
    "city_province" VARCHAR(255) NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" VARCHAR(36) NOT NULL,
    "product_name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "brand_id" VARCHAR(36) NOT NULL,
    "category_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" VARCHAR(36) NOT NULL,
    "size" INTEGER NOT NULL,
    "color" VARCHAR(36) NOT NULL,
    "sku" VARCHAR(36) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" VARCHAR(36) NOT NULL,
    "url" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "product_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" VARCHAR(36) NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" VARCHAR(36) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cart_id" VARCHAR(36) NOT NULL,
    "variant_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" VARCHAR(36) NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "shipping_address_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" VARCHAR(36) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_at_purchase" DOUBLE PRECISION NOT NULL,
    "order_id" VARCHAR(36) NOT NULL,
    "variant_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" VARCHAR(36) NOT NULL,
    "method" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "order_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shippings" (
    "id" VARCHAR(36) NOT NULL,
    "carrier" TEXT NOT NULL,
    "tracking_number" TEXT,
    "shipping_cost" DOUBLE PRECISION NOT NULL,
    "order_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "shippings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" VARCHAR(36) NOT NULL,
    "code" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_coupons" (
    "id" VARCHAR(36) NOT NULL,
    "discount_applied" DOUBLE PRECISION NOT NULL,
    "order_id" VARCHAR(36) NOT NULL,
    "coupon_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "order_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_tokens" (
    "id" VARCHAR(36) NOT NULL,
    "security_code" VARCHAR(100) NOT NULL,
    "token_id" VARCHAR(255) NOT NULL,
    "contract_address" VARCHAR(255) NOT NULL,
    "mint_tx_hash" VARCHAR(66) NOT NULL,
    "metadata_cid" VARCHAR(100) NOT NULL,
    "is_transferred" BOOLEAN NOT NULL DEFAULT false,
    "transfer_tx_hash" VARCHAR(66),
    "initial_owner_wallet" VARCHAR(255) NOT NULL,
    "current_owner_wallet" VARCHAR(255),
    "is_authentic" BOOLEAN NOT NULL DEFAULT true,
    "variant_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "product_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_activations" (
    "id" VARCHAR(36) NOT NULL,
    "security_code" VARCHAR(100) NOT NULL,
    "product_token_id" VARCHAR(36) NOT NULL,
    "activator_user_id" VARCHAR(36) NOT NULL,
    "recipient_wallet" VARCHAR(255) NOT NULL,
    "is_transfer_complete" BOOLEAN NOT NULL DEFAULT false,
    "transfer_tx_hash" VARCHAR(66),
    "activated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "token_activations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authentication_logs" (
    "id" VARCHAR(36) NOT NULL,
    "security_code" VARCHAR(100) NOT NULL,
    "ip_address" VARCHAR(50) NOT NULL,
    "user_agent" VARCHAR(512),
    "is_suspicious" BOOLEAN NOT NULL DEFAULT false,
    "is_genuine" BOOLEAN NOT NULL,
    "product_token_id" VARCHAR(36) NOT NULL,
    "checked_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authentication_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "roleIdx" ON "users"("role");

-- CreateIndex
CREATE INDEX "userStatusIdx" ON "users"("status");

-- CreateIndex
CREATE INDEX "addressUserIdIdx" ON "addresses"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "brandIdIdx" ON "products"("brand_id");

-- CreateIndex
CREATE INDEX "categoryIdIdx" ON "products"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "variantProductIdIdx" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "imageProductIdIdx" ON "images"("product_id");

-- CreateIndex
CREATE INDEX "reviewProductIdIdx" ON "reviews"("product_id");

-- CreateIndex
CREATE INDEX "reviewUserIdIdx" ON "reviews"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");

-- CreateIndex
CREATE INDEX "cartItemCartIdIdx" ON "cart_items"("cart_id");

-- CreateIndex
CREATE INDEX "cartItemVariantIdIdx" ON "cart_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_variant_id_key" ON "cart_items"("cart_id", "variant_id");

-- CreateIndex
CREATE INDEX "orderUserIdIdx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orderStatusIdx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orderItemOrderIdIdx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "orderItemVariantIdIdx" ON "order_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_variant_id_key" ON "order_items"("order_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "paymentStatusIdx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "shippings_order_id_key" ON "shippings"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "orderCouponOrderIdIdx" ON "order_coupons"("order_id");

-- CreateIndex
CREATE INDEX "orderCouponCouponIdIdx" ON "order_coupons"("coupon_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_coupons_order_id_coupon_id_key" ON "order_coupons"("order_id", "coupon_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_tokens_security_code_key" ON "product_tokens"("security_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_tokens_token_id_key" ON "product_tokens"("token_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_tokens_mint_tx_hash_key" ON "product_tokens"("mint_tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "product_tokens_metadata_cid_key" ON "product_tokens"("metadata_cid");

-- CreateIndex
CREATE UNIQUE INDEX "product_tokens_transfer_tx_hash_key" ON "product_tokens"("transfer_tx_hash");

-- CreateIndex
CREATE INDEX "tokenVariantIdIdx" ON "product_tokens"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "token_activations_security_code_key" ON "token_activations"("security_code");

-- CreateIndex
CREATE UNIQUE INDEX "token_activations_product_token_id_key" ON "token_activations"("product_token_id");

-- CreateIndex
CREATE UNIQUE INDEX "token_activations_transfer_tx_hash_key" ON "token_activations"("transfer_tx_hash");

-- CreateIndex
CREATE INDEX "activatorUserIdIdx" ON "token_activations"("activator_user_id");

-- CreateIndex
CREATE INDEX "productTokenIdIdx" ON "authentication_logs"("product_token_id");
