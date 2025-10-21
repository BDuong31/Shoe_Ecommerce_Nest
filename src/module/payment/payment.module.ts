import { Module, Provider } from "@nestjs/common";
import { PAYMENT_SERVICE, PAYMENT_REPOSITORY } from "./payment.di-token";
import { PaymentService } from "./payment.service";
import { PaymentPrismaRepository } from "./payment-prisma.repo";
import { ShareModule } from "src/share/module";
import { PaymentHttpController } from "./payment-http.controller";

const dependencies: Provider[] = [
    { provide: PAYMENT_SERVICE, useClass: PaymentService },
    { provide: PAYMENT_REPOSITORY, useClass: PaymentPrismaRepository }
];

@Module({
    imports: [ShareModule],
    controllers: [PaymentHttpController],
    providers: [...dependencies],
})

export class PaymentModule {}