import { Module, Provider } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritePrismaRepository } from './favorites-prisma.repo';
import { RemoteAuthGuard } from 'src/share/guard';
import { ShareModule } from 'src/share/module';
import { FavoriteHttpController } from './favorites-http.controller';
import { FAVORITES_REPOSITORY, FAVORITES_SERVICE } from './favorites.di-token';
import { REMOTE_AUTH_GUARD } from 'src/share/di-token';

const dependencies: Provider[] = [
    { provide: FAVORITES_SERVICE, useClass: FavoritesService },
    { provide: FAVORITES_REPOSITORY, useClass: FavoritePrismaRepository },
    { provide: REMOTE_AUTH_GUARD, useClass: RemoteAuthGuard }, 
];

@Module({
    imports: [ShareModule],
    controllers: [FavoriteHttpController],
    providers: [...dependencies],
})
export class FavoritesModule {}