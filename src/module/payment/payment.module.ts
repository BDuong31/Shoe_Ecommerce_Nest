import { Module, Provider } from "@nestjs/common";
import { PAYMENT_SERVICE, PAYMENT_REPOSITORY } from "./payment.di-token";
import { PaymentService } from "./payment.service";
import { PaymentPrismaRepository } from "./payment-prisma.repo";
import { ShareModule } from "src/share/module";
import { PaymentHttpController } from "./payment-http.controller";

import { VnpayService } from "./vnpay.service";
import { MomoService } from "./momo.service";
import { ZalopayService } from "./zalo.service";
import { ConfigModule } from "@nestjs/config";

const dependencies: Provider[] = [
    { provide: PAYMENT_SERVICE, useClass: PaymentService },
    { provide: PAYMENT_REPOSITORY, useClass: PaymentPrismaRepository },
    VnpayService,
    MomoService,
    ZalopayService,
];

@Module({
    imports: [
        ShareModule,
        ConfigModule.forRoot({isGlobal: true}),
    ],
    controllers: [PaymentHttpController],
    providers: [...dependencies],
})

export class PaymentModule {}