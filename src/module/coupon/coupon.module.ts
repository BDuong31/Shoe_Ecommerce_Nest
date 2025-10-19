import { Module, Provider } from '@nestjs/common';
import { COUPON_REPOSITORY, COUPON_SERVICE } from './coupon.di-token';
import { CouponService } from './coupon.service'
import { CouponPrismaRepository } from './coupon-prisma.repo';
import { ShareModule } from 'src/share/module';
import { CouponHttpController } from './coupon-http.controller';

const dependencies: Provider[] = [
    { provide: COUPON_SERVICE, useClass: CouponService },
    { provide: COUPON_REPOSITORY, useClass: CouponPrismaRepository },
];

@Module({
    imports: [ShareModule],
    controllers: [CouponHttpController],
    providers: [...dependencies],
})
export class CouponModule {}