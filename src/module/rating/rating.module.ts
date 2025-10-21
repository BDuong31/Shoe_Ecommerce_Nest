import { Module, Provider } from "@nestjs/common";
import { RATING_SERVICE, RATING_REPOSITORY } from "./rating.di-token";
import { RatingService } from "./rating.service";
import { RatingPrismaRepository } from "./rating-prisma.repo";
import { ShareModule } from "src/share/module";
import { RatingHttpController } from "./rating-http.controller";

const dependencies: Provider[] = [
    { provide: RATING_SERVICE, useClass: RatingService },
    { provide: RATING_REPOSITORY, useClass: RatingPrismaRepository }
];

@Module({
    imports: [ShareModule],
    controllers: [RatingHttpController],
    providers: [...dependencies],
})

export class RatingModule {}
