import { Module, Provider } from "@nestjs/common";
import { ORDER_SERVICE, ORDER_REPOSITORY, ORDER_ITEM_SERVICE, ORDER_ITEM_REPOSITORY } from "./order.di-token";
import { OrderItemService, OrderService } from "./order.service";
import { OrderItemPrismaRepository, OrderPrismaRepository } from "./order-prisma.repo";
import { ShareModule } from "src/share/module";
import { OrderHttpController, OrderItemHttpController } from "./order-http.controller";

const dependencies: Provider[] = [
    { provide: ORDER_SERVICE, useClass: OrderService },
    { provide: ORDER_REPOSITORY, useClass: OrderPrismaRepository },
    { provide: ORDER_ITEM_SERVICE, useClass: OrderItemService },
    { provide: ORDER_ITEM_REPOSITORY, useClass: OrderItemPrismaRepository },
];

@Module({
    imports: [ShareModule],
    controllers: [OrderHttpController, OrderItemHttpController],
    providers: [...dependencies],
})

export class OrderModule {}