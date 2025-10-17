import { Module, Provider } from "@nestjs/common";
import { PRODUCT_SERVICE, PRODUCT_REPOSITORY } from "./product.di-token";
import { ProductService } from "./product.service";
import { ProductPrismaRepository } from "./product-prisma.repo";
import { ShareModule } from 'src/share/module';
import { ProductHttpController } from "./product-http.controller";
import { REMOTE_AUTH_GUARD } from "src/share/di-token";
import { RemoteAuthGuard } from "src/share/guard/auth";

const dependencies: Provider[] = [
  { provide: PRODUCT_SERVICE, useClass: ProductService },
  { provide: PRODUCT_REPOSITORY, useClass: ProductPrismaRepository },
  { provide: REMOTE_AUTH_GUARD, useClass: RemoteAuthGuard },
];

@Module({
  imports: [ShareModule],
  controllers: [ProductHttpController],
  providers: [...dependencies],
})
export class ProductModule {}