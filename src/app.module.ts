import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { AddressModule } from './module/address/address.module';
import { BrandModule } from './module/brand/brand.module';
import { CategoryModule } from './module/category/category.module';
import { ProductModule } from './module/product/product.module';
import { ImageModule } from './module/image/image.module';
import { VariationModule } from './module/variation/variation.module';
import { CartModule } from './module/cart/cart.module';
import { CouponModule } from './module/coupon/coupon.module';
import { OrderModule } from './module/order/order.module';
import { ShippingModule } from './module/shipping/shipping.module';
import { PaymentModule } from './module/payment/payment.module';
import { RatingModule } from './module/rating/rating.module';
import { TokenModule } from './module/token/token.module';
import { FavoritesModule } from './module/favorites/favorites.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
      serveRoot: '/assets',
    }),
    UserModule,
    AddressModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    ImageModule,
    VariationModule,
    CartModule,
    CouponModule,
    OrderModule,
    ShippingModule,
    PaymentModule,
    RatingModule,
    TokenModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
