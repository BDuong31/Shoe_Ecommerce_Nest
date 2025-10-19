import { Module, Provider } from "@nestjs/common";
import { ORDER_SERVICE, ORDER_REPOSITORY, ORDER_ITEM_SERVICE, ORDER_ITEM_REPOSITORY, ORDER_COUPON_SERVICE, ORDER_COUPON_REPOSITORY } from "./order.di-token";
import { OrderCouponService, OrderItemService, OrderService } from "./order.service";
import { OrderCouponPrismaRepository, OrderItemPrismaRepository, OrderPrismaRepository } from "./order-prisma.repo";
import { ShareModule } from "src/share/module";
import { OrderCouponHttpController, OrderHttpController, OrderItemHttpController } from "./order-http.controller";

const dependencies: Provider[] = [
    { provide: ORDER_SERVICE, useClass: OrderService },
    { provide: ORDER_REPOSITORY, useClass: OrderPrismaRepository },
    { provide: ORDER_ITEM_SERVICE, useClass: OrderItemService },
    { provide: ORDER_ITEM_REPOSITORY, useClass: OrderItemPrismaRepository },
    { provide: ORDER_COUPON_SERVICE, useClass: OrderCouponService },
    { provide: ORDER_COUPON_REPOSITORY, useClass: OrderCouponPrismaRepository },
];

@Module({
    imports: [ShareModule],
    controllers: [OrderHttpController, OrderItemHttpController, OrderCouponHttpController],
    providers: [...dependencies],
})

export class OrderModule {}