import { Module, Provider } from "@nestjs/common";
import { RedisClient } from "./components";
import { config } from "./config";
import { ADDRESS_RPC, BRAND_RPC, CATEGORY_RPC, EVENT_PUBLISHER, ORDER_RPC, PAYMENT_RPC, PRODUCT_RPC, RATING_RPC, SHIPPING_RPC, TOKEN_INTROSPECTOR, USER_RPC, VARIANT_RPC,  } from "./di-token";
import { TokenIntrospectRPCClient, UserRPCClient, AddressRPCClient, ProductRPCClient, VariantRPCClient, RatingRPCClient, OrderRPCClient, PaymentRPCClient, ShippingRPCClient, BrandRPCClient, CategoryRPCClient } from "./rpc";

// Khởi tạo client cho việc kiểm tra token
const tokenRPCClient = new TokenIntrospectRPCClient(config.rpc.introspectUrl);
const tokenIntrospector: Provider = {
  provide: TOKEN_INTROSPECTOR,
  useValue: tokenRPCClient,
};

// Khởi tạo client cho việc giao tiếp với user service
const userRPCClient = new UserRPCClient(config.rpc.userServiceURL);
const userRPC: Provider = {
  provide: USER_RPC,
  useValue: userRPCClient,
};

// Khởi tạo client cho việc giao tiếp với address service
const addressRPCClient = new AddressRPCClient(config.rpc.addressServiceURL);
const addressRPC: Provider = {
  provide: ADDRESS_RPC,
  useValue: addressRPCClient,
};

const brandRPCClient = new BrandRPCClient(config.rpc.brandServiceURL);
const brandRPC: Provider = {
  provide: BRAND_RPC,
  useValue: brandRPCClient,
};

const categoryRPCClient = new CategoryRPCClient(config.rpc.categoryServiceURL);
const categoryRPC: Provider = {
  provide: CATEGORY_RPC,
  useValue: categoryRPCClient,
};

const productRPCClient = new ProductRPCClient(config.rpc.productServiceURL);
const productRPC: Provider = {
  provide: PRODUCT_RPC,
  useValue: productRPCClient,
};

const variantRPCClient = new VariantRPCClient(config.rpc.productServiceURL);
const variantRPC: Provider = {
  provide: VARIANT_RPC,
  useValue: variantRPCClient,
};

const ratingRPCClient = new RatingRPCClient(config.rpc.reviewServiceURL);
const ratingRPC: Provider = {
  provide: RATING_RPC,
  useValue: ratingRPCClient,
};

const orderRPCClient = new OrderRPCClient(config.rpc.orderServiceURL);
const orderRPC: Provider = {
  provide: ORDER_RPC,
  useValue: orderRPCClient,
};

const paymentRPCClient = new PaymentRPCClient(config.rpc.paymentServiceURL);
const paymentRPC: Provider = {
  provide: PAYMENT_RPC,
  useValue: paymentRPCClient,
};

const shippingRPCClient = new ShippingRPCClient(config.rpc.shippingServiceURL);
const shippingRPC: Provider = {
  provide: SHIPPING_RPC,
  useValue: shippingRPCClient,
};

// Khởi tạo client cho việc giao tiếp với Redis
const redisClient: Provider = {
  provide: EVENT_PUBLISHER,
  useFactory: async () => {
    await RedisClient.init(config.redis.url);
    return RedisClient.getInstance();
  }
};


// Tạo module chia sẻ
@Module({
  providers: [tokenIntrospector, userRPC, addressRPC, brandRPC, categoryRPC, productRPC, variantRPC, ratingRPC, orderRPC, paymentRPC, shippingRPC, redisClient],
  exports: [tokenIntrospector, userRPC, addressRPC, brandRPC, categoryRPC, productRPC, variantRPC, ratingRPC, orderRPC, paymentRPC, shippingRPC, redisClient]
})

export class ShareModule { }
