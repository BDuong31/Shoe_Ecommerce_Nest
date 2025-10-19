import { Module, Provider } from "@nestjs/common";
import { SHIPPING_SERVICE, SHIPPING_REPOSITORY } from "./shipping.di-token";
import { ShippingService } from "./shipping.service";
import { ShippingPrismaRepository } from "./shipping-prisma.repo";
import { ShareModule } from "src/share/module";
import { ShippingHttpController } from "./shipping-http.controller";

const dependencies: Provider[] = [
    { provide: SHIPPING_SERVICE, useClass: ShippingService },
    { provide: SHIPPING_REPOSITORY, useClass: ShippingPrismaRepository }
];

@Module({
    imports: [ShareModule],
    controllers: [ShippingHttpController],
    providers: [...dependencies],
})

export class ShippingModule {}