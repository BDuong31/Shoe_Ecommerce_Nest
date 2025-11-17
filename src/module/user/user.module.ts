import { Module, Provider } from '@nestjs/common';
import { config } from 'src/share';
import { JwtTokenService } from 'src/share/components/jwt';
import { ShareModule } from 'src/share/module';
import { UserCouponRpcHttpController, UserHttpController, UserRpcHttpController } from './user-http.controller';
import { UserCouponPrismaRepository, UserPrismaRepository } from './user-prisma.repo';
import { TOKEN_PROVIDER, USER_COUPON_REPOSITORY, USER_COUPON_SERVICE, USER_REPOSITORY, USER_SERVICE } from './user.di-token';
import { UserCouponService, UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';

// Khai báo các Provider
const repositories: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
  { provide: USER_COUPON_REPOSITORY, useClass: UserCouponPrismaRepository },
];

// Khai báo các Service
const services: Provider[] = [
  { provide: USER_SERVICE, useClass: UserService },
  { provide: USER_COUPON_SERVICE, useClass: UserCouponService },
];

// Khai báo Provider tạo và xác thực token
const tokenJWTProvider = new JwtTokenService(config.rpc.jwtSecret, '7d');
const tokenProvider: Provider = { provide: TOKEN_PROVIDER, useValue: tokenJWTProvider };

// Khai báo Module User
@Module({
  imports: [ShareModule, ConfigModule],
  controllers: [UserHttpController, UserRpcHttpController, UserCouponRpcHttpController],
  providers: [...repositories, ...services, tokenProvider],
  exports: [USER_SERVICE, USER_REPOSITORY, USER_COUPON_SERVICE, USER_COUPON_REPOSITORY], 
})

export class UserModule {}
