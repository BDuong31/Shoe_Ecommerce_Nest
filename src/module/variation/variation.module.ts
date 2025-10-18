import { VARIATION_SERVICE, VARIATION_REPOSITORY } from "./variation.di-token";
import { VariationService } from "./variation.service";
import { VariationPrismaRepository } from "./variation-prisma.repo";
import { Module, Provider } from "@nestjs/common";
import { ShareModule } from "src/share/module";
import { VariationHttpController } from "./variation-http.controller";

const dependencies: Provider[] = [
    { provide: VARIATION_SERVICE, useClass: VariationService },
    { provide: VARIATION_REPOSITORY, useClass: VariationPrismaRepository }
];

@Module({
    imports: [ShareModule],
    controllers: [VariationHttpController],
    providers: [...dependencies],
})

export class VariationModule {}