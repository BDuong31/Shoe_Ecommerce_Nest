import { Module, Provider } from "@nestjs/common";
import { CATEGORY_SERVICE, CATEGORY_REPOSITORY } from "./category.di-token";
import { CategoryService } from "./category.service";
import { CategoryPrismaRepository } from "./category-prisma.repo";
import { ShareModule } from "src/share/module";
import { CategoryHttpController } from "./category-http.controller";

const dependencies: Provider[] = [
    { provide: CATEGORY_SERVICE, useClass: CategoryService },
    { provide: CATEGORY_REPOSITORY, useClass: CategoryPrismaRepository }
];

@Module({
    imports: [ShareModule],
    controllers: [CategoryHttpController],
    providers: [...dependencies],
})

export class CategoryModule {}