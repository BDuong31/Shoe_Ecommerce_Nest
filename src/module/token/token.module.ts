import { Module, Provider } from "@nestjs/common";
import { TOKEN_SERVICE, TOKEN_REPOSITORY, TOKEN_ACTIVATION_REPOSITORY, AUTHENTICATIONLOG_REPOSITORY } from "./token.di-token";
import { TokenService } from "./token.service";
import { AuthenticationLogPrismaRepository, ProductTokenPrismaRepository, TokenActivationPrismaRepository, } from "./token-prisma.repo";
import { ShareModule } from "src/share/module";
import { TokenHttpController } from "./token-http.controller";

const dependencies: Provider[] = [
    { provide: TOKEN_SERVICE, useClass: TokenService },
    { provide: TOKEN_REPOSITORY, useClass: ProductTokenPrismaRepository },
    { provide: TOKEN_ACTIVATION_REPOSITORY, useClass: TokenActivationPrismaRepository },
    { provide: AUTHENTICATIONLOG_REPOSITORY, useClass: AuthenticationLogPrismaRepository },
];

@Module({
    imports: [ShareModule],
    controllers: [TokenHttpController],
    providers: [...dependencies],
})

export class TokenModule {}