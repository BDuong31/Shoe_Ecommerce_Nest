import { CART_SERVICE, CART_REPOSITORY, CART_ITEM_REPOSITORY, CART_ITEM_SERVICE } from "./cart.di-token";
import { CartItemService, CartService } from "./cart.service";
import { CartItemPrismaRepository, CartPrismaRepository } from "./cart-prisma.repo";
import { Module, Provider } from "@nestjs/common";
import { ShareModule } from "src/share/module";
import { CartHttpController, CartItemHttpController,  } from "./cart-http.controller";

const dependencies: Provider[] = [
    { provide: CART_SERVICE, useClass: CartService },
    { provide: CART_REPOSITORY, useClass: CartPrismaRepository },
    { provide: CART_ITEM_REPOSITORY, useClass: CartItemPrismaRepository },
    { provide: CART_ITEM_SERVICE, useClass: CartItemService }
];

@Module({
    imports: [ShareModule],
    controllers: [CartHttpController, CartItemHttpController],
    providers: [...dependencies],
})

export class CartModule {}