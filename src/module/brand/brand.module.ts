import { Module, Provider } from "@nestjs/common";
import { BRAND_SERVICE, BRAND_REPOSITORY } from "./brand.di-token";
import { BrandService } from "./brand.service";
import { BrandPrismaRepository } from "./brand-prisma.repo";
import { ShareModule } from "src/share/module";
import { BrandHttpController } from "./brand-http.controller";

const dependencies: Provider[] = [
    { provide: BRAND_SERVICE, useClass: BrandService },
    { provide: BRAND_REPOSITORY, useClass: BrandPrismaRepository }
];

@Module({
    imports: [ShareModule],
    controllers: [BrandHttpController],
    providers: [...dependencies],
})

export class BrandModule {}